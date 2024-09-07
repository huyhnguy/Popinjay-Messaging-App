const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversation");
const { body, validationResult } = require("express-validator");
const User = require("../models/user")
const mongoose = require("mongoose");

exports.dms_create_post = asyncHandler(async (req, res, next) => {
    // look for a possible pre-existing conversation between these two users in the database
    const dm = await Conversation.findOne({ 
        users: { 
            $size: 2,
            $all: [req.body.other_user_id, req.user.id]
        } 
    }).populate({
        path: 'history',
        populate: {
            path: 'user',
            select: 'display_name'
        }
    }).exec();
    
    // if this conversation doesn't already exist in the database, create a new one
    if (!dm) {
        const newDm = new Conversation({
            users: [req.body.other_user_id, req.user.id]
        })
        await newDm.save();

        res.json({ sender: req.user.id, dm: newDm, message: "new conversation created"});
    } else {
        res.json({ sender: req.user.id, dm: dm, message: "pre-existing conversation sent"});
    }
});

exports.dms_list_get = asyncHandler(async (req, res, next) => {
    try {
        const dms = await Conversation.find({
            users: {
                $elemMatch: { $eq: req.user.id },
                $size: 2
            },
            history: {
                $ne: []
            }
        }).lean().select({
            history: { $slice: -1 }
        }).populate({
            path: 'history',
            select: 'user content createdAt image'
        }).populate({
            path: 'users',
            match: { _id: { $ne: req.user.id }},
            select: 'display_name profile_picture'
        }).exec();
        
        res.json({ sender: req.user.id, dms: dms });
    } catch (err) {
        console.error('query error', err);
    }
})

exports.dm_get = asyncHandler(async (req, res, next) => {
    const dm = await Conversation.findById(req.params.dmId).populate({
        path: 'history',
        populate: {
            path: 'user',
            select: 'display_name'
        }
    }).populate({
        path: 'users',
        match: { _id: { $ne: req.user.id }},
        select: 'display_name profile_picture'
    }).lean().exec();

    res.json({ dm: dm, sender: req.user.id })
    console.log(dm);
})

exports.group_get = asyncHandler(async (req, res, next) => {
    const group = await Conversation.findById( req.params.groupId , { users: 0 }).lean().populate({
        path: 'history',
        select: 'content createdAt user image',
        populate: {
            path: 'user',
            select: 'display_name'
        }
    }).exec();

    res.json({ group: group, sender: req.user.id })
    console.log(group);
})

exports.groups_list_get = asyncHandler(async (req, res, next) => {
    try {
        const groups = await Conversation.find({
            users: req.user.id,
            $expr: { $gte: [ {$size: "$users" }, 3]}
        }).lean().select({
            history: { $slice: -1 }
        }).populate({
            path: 'history',
            select: 'user content createdAt image',
            populate: {
                path: 'user',
                select: 'display_name'
            }
        }).populate({
            path: 'users',
            match: { 
                _id: { $ne: req.user.id },
            },
            select: 'display_name',
            options: { limit: 5 }
        }).exec();

        res.json({ sender: req.user.id, groups: groups });
    } catch (err) {
        console.error(err);
    }
})

exports.groups_create_post = [
    body("display_name")
        .trim()
        .isLength({ max: 35 })
        .withMessage("Name cannot be more than 35 characters")
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const userArray = [...req.body.users, req.user.id];

        if (!errors.isEmpty()) {
            res.json({
                profile_picture: req.body.profile_picture,
                display_name: req.body.display_name,
                users: userArray,
                errors: errors.array()
            })
        } else {
            const conversation = new Conversation({
                profile_picture: req.body.profile_picture,
                display_name: req.body.display_name,
                users: userArray,
            })
            await conversation.save();

            res.status(201).json({ "status": 201, message: 'Successfully created conversation' });
        }
    })
]