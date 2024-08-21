const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversation");
const User = require("../models/user")

exports.dms_create_post = asyncHandler(async (req, res, next) => {
    console.log(req.user);
    console.log(req.body.other_user_id);
    const user = await User.findOne({ "login.username": req.user.username })
    console.log(`user found ${user}`)
    const conversation = new Conversation({
        users: [req.body.other_user_id, user._id]
    })

    await conversation.save();

    res.json(conversation);
});