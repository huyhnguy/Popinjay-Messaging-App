const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversation");
const User = require("../models/user")

exports.dms_create_post = asyncHandler(async (req, res, next) => {
    console.log(req.user);
    console.log(req.body.other_user);
    const user = await User.findOne({ "login.username": req.user.username })
    console.log(`user found ${user}`)
    /*const conversation = new Conversation({
        users: [req.body.users]
    })

    await conversation.save();

    res.json(conversation);*/
});