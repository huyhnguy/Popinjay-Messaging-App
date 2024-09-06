const asyncHandler = require("express-async-handler");
const Message = require("../models/message");
const Conversation = require("../models/conversation")

exports.message_create_post = asyncHandler(async (req, res, next) => {
    const newMessage = new Message({
        user: req.user.id,
        content: req.body.new_message,
        image: req.body.image
    })
    await newMessage.save();

    const conversation = await Conversation.findById(req.body.conversation_id);
    conversation.history.push(newMessage._id);

    try {
        await conversation.save();
    } catch (err) {
        console.error('error saving conversation:', err);
    }
  
    const populatedConversation = await Conversation.findById(conversation._id).populate({
        path: 'history',
        populate: {
            path: 'user',
            select: 'display_name'
        }
    });

    res.json({ conversation: populatedConversation, message: "Message successfully created and saved into the conversation"})
})

exports.message_delete = asyncHandler(async (req, res, next) => {
    console.log(req.params);
    console.log(req.body);
    try {
        await Message.findByIdAndDelete(req.params.messageId);
        await Conversation.updateOne({ _id: req.body.conversation_id}, {
            $pull: {
                history: req.params.messageId
            }
        }).exec();

        const conversation = await Conversation.findById(req.body.conversation_id).populate({
            path: 'history',
            populate: {
                path: 'user',
                select: 'display_name'
            }
        }).exec()
        console.log(conversation);

        res.json({ conversation: conversation, message: "message successfully deleted" })
    } catch (err) {
        console.log(err);
        res.json({ message: "message could not be deleted", error: err})
    }
})