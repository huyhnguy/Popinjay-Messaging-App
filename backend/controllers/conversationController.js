const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversation");
const User = require("../models/user")

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
    const dms = await Conversation.find({ 
        users: { 
            $size: 2,
        } 
    }).find({
        users: req.user.id
    }).find({
        'history.0': {
            $exists: true
        }
    }).populate({
        path: 'history',
        populate: {
            path: 'user',
            select: 'display_name'
        }
    }).populate({
        path: 'users',
        select: 'display_name profile_picture'
    }).exec();

    res.json({ sender: req.user.id, dms: dms });
})