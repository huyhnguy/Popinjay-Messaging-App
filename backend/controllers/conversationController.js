const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversation");
const User = require("../models/user")

exports.dms_create_post = asyncHandler(async (req, res, next) => {
    console.log(req.user);
    console.log(req.body.other_user_id);
    const user = await User.findOne({ "login.username": req.user.username })

    // look for a possible pre-existing conversation between these two users in the database
    const dm = await Conversation.findOne({ 
        users: { 
            $size: 2,
            $all: [req.body.other_user_id, user._id]
        } 
    
    })
    console.log(dm);
    
    // if this conversation doesn't already exist in the database, create a new one
    if (!dm) {
        const newDm = new Conversation({
            users: [req.body.other_user_id, user._id]
        })

        await newDm.save();

        res.json({ dm: newDm, message: "new conversation created"});
    } else {
        res.json({ dm: dm, message: "pre-existing conversation sent"});
    }

});