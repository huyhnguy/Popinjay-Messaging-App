const asyncHandler = require("express-async-handler");
const Message = require("../models/message");
const Conversation = require("../models/conversation")

exports.message_create_post = asyncHandler(async (req, res, next) => {
    try {
        const newMessage = new Message({
            user: req.user.id,
            content: req.body.new_message,
            image: req.body.image
        })
        const [newMessageSave, conversation] = await Promise.all([ newMessage.save(), Conversation.findById(req.body.conversation_id).exec()])
        conversation.history.push(newMessage._id);
        await conversation.save();

        res.json({ new_message: newMessage, message: "Message successfully created and saved into the conversation" })
    } catch (err) {
        console.error('error saving conversation:', err);

        res.status(400).send({ message: "Error creating message" });
    }
})

exports.message_update = asyncHandler(async (req, res, next) => {
    try {
        const updatedMessage = await Message.findOneAndUpdate({ _id: req.params.messageId }, { content: req.body.new_message, image: req.body.image }, { new: true });

        const populatedMessage = await updatedMessage.populate('user', 'display_name');

        res.json({ updated_message: populatedMessage, message: "message successfully updated"})
    } catch (err) {
        console.error(err);

        res.json({ message: "message could not be updated", error: err})
    }
})

exports.message_delete = asyncHandler(async (req, res, next) => {
    try {
        await Promise.all([
            Conversation.findOneAndUpdate({ _id: req.body.conversation_id}, { $pull: { history: req.params.messageId } }).exec(),
            Message.findByIdAndDelete(req.params.messageId).exec()
        ])
        
        res.json({ message: "message successfully deleted" })
    } catch (err) {
        console.log(err);

        res.json({ message: "message could not be deleted", error: err})
    }
})