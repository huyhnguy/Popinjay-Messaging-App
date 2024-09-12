const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversation");
const Message = require("../models/message")
const { body, validationResult } = require("express-validator");
const User = require("../models/user")
const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;

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
    const group = await Conversation.findById( req.params.groupId ).lean().populate({
        path: 'history',
        select: 'content createdAt user image',
        populate: {
            path: 'user',
            select: 'display_name'
        }
    }).populate({
        path: 'users',
        select: 'display_name'
    }).exec();

    res.json({ group: group, sender: req.user.id })
    console.log(group);
})

exports.group_settings_get = asyncHandler(async (req, res, next) => {
    const group = await Conversation.findById( req.params.groupId , { history: 0 }).lean().populate({
        path: 'users',
        select: 'display_name profile_picture'
    }).exec();

    console.log(group);

    res.json({ group: group, sender: req.user.id })
})

exports.group_settings_put = [
    body("display_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter a display name")
        .isLength({ max: 30 })
        .withMessage("Display name cannot be longer than 30 characters")
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({
                display_name: req.body.display_name,
                profile_picture: req.file,
                about_me: req.body.about_me,
                errors: errors.array()
            })
        } else {
            try {
                console.log(req.file);
                console.log(req.body);
                
                const conversation = await Conversation.findById(req.params.groupId).exec();
                conversation.display_name = req.body.display_name;

                if (req.body.admin_permissions.includes('delete-messages')) {
                    conversation.admin_permissions.delete_messages = true
                } else {
                    conversation.admin_permissions.delete_messages = false
                }

                if (req.body.admin_permissions.includes('invite-users')) {
                    conversation.admin_permissions.invite_users = true
                } else {
                    conversation.admin_permissions.invite_users = false
                }

                if (req.body.admin_permissions.includes('kick-users')) {
                    conversation.admin_permissions.kick_users = true
                } else {
                    conversation.admin_permissions.kick_users = false
                }

                if (req.file) {
                    const options = {
                        public_id: req.params.groupId,
                        overwrite: true,
                      };              
                    const image = await cloudinary.uploader.upload(req.file.path , options);
                    conversation.profile_picture = image.secure_url;
                } else {
                    if (req.body.picture_status === "delete") {
                        conversation.profile_picture = null;
                        await cloudinary.uploader.destroy(req.params.groupId, function(result) { console.log(result) })
                    }
                } 

                await conversation.save();
            
                res.json({ group: conversation, message: "new group settings changed" });
              } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Error updating group settings' });
              }
        }
    })
]

exports.group_settings_delete = asyncHandler(async (req, res, next) => {
    try {
        const group = await Conversation.findById(req.params.groupId).exec();

        if (!group) {
            console.log('group not found');
            return;
        }

            //await cloudinary.uploader.destroy(req.params.groupId, function(result) { console.log(result) });
            const [deletedImageUrl, deletedMessages, deletedGroup] = await Promise.all([cloudinary.uploader.destroy(req.params.groupId, function(result) { console.log(result) }) ,Message.deleteMany({_id: { $in: group.history }}), Conversation.deleteOne({ _id: req.params.groupId }) ])
       
    
        //const deletedMessages = await Message.deleteMany({_id: { $in: group.history }})
        //const deletedGroup = await Conversation.deleteOne({ _id: req.params.groupId });

       // const [deletedMessages, deletedGroup] = await Promise.all([Message.deleteMany({_id: { $in: group.history }}), Conversation.deleteOne({ _id: req.params.groupId }) ])

        console.log(`deleted ${deletedMessages.deletedCount} messages`);
        
        if (deletedGroup.deletedCount === 1) {
            console.log('conversation successfully deleted')
            res.json({ message: "group successfully deleted"})
        } else {
            console.log ('failed to delete conversation');
            res.json({ message: "failed to delete conversation"})
        }
    } catch (err) {
        console.log('error deleting group: ' + err);
        res.status(500).json({ error: err, message: "error deleting group"})
    }

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

        console.log(groups);
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
                profile_picture: req.file,
                display_name: req.body.display_name,
                users: userArray,
                errors: errors.array()
            })
        } else {
                const conversation = new Conversation({
                    display_name: req.body.display_name,
                    users: userArray,
                })
                if (req.file) {
                    const options = {
                        public_id: conversation._id,
                        overwrite: true,
                      };              
                    try {
                    const image = await cloudinary.uploader.upload(req.file.path , options);
                    conversation.profile_picture = image.secure_url;
    
                    } catch (err) {
                    console.error(err);
                    }
                }
                await conversation.save();

                console.log(conversation);

                res.status(201).json({ "status": 201, message: 'Successfully created conversation', conversation: conversation });
        }
    })
]

exports.group_user_delete = asyncHandler(async (req, res, next) => {
    try {
        const result = await Conversation.updateOne({ _id: req.params.groupId }, { $pull: { users: req.params.userId }});
        console.log(result);
        console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
        res.json({ message: "successfully deleted user from group" })
    } catch (err) {
        console.log(`error deleting user from group: ${err}`)
        res.status(500).json({ error: `error deleting user from group: ${err}` })
    }
})


