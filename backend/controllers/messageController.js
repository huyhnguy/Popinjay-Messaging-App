const asyncHandler = require("express-async-handler");
const Message = require("../models/message");
const Conversation = require("../models/conversation")

exports.message_create_post = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const newMessage = new Message({
        user: req.user.id,
        content: req.body.new_message,
        image: req.body.image
    })
    await newMessage.save();

    console.log(newMessage);

    const conversation = await Conversation.findById(req.body.conversation_id);
    conversation.history.push(newMessage._id);
    await conversation.save();
    const populatedConversation = await Conversation.findById(req.body.conversation_id).populate({
        path: 'history',
        populate: {
            path: 'user',
            select: 'display_name'
        }
    }).exec();

    res.json({ conversation: populatedConversation, message: "Message successfully created and saved into the conversation"})
})