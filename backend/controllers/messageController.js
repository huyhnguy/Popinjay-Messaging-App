const asyncHandler = require("express-async-handler");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const cloudinary = require('cloudinary').v2;

exports.message_create_post = asyncHandler(async (req, res, next) => {
    try {
        const newMessage = new Message({
            user: req.user.id,
            content: req.body.new_message,
        })

        if (req.file) {
            const options = {
                public_id: newMessage._id,
                overwrite: true,
              };              
            const image = await cloudinary.uploader.upload(req.file.path , options);
            newMessage.image = image.secure_url;
        }

        newMessage.save();

        const [newMessagePopulated, conversation] = await Promise.all([ newMessage.populate('user', 'id'), Conversation.findById(req.body.conversation_id).exec()])
        conversation.history.push(newMessage._id);
        await conversation.save();

        res.json({ new_message: newMessagePopulated , message: "Message successfully created and saved into the conversation" })
    } catch (err) {
        console.error('error saving conversation:', err);

        res.status(400).send({ message: "Error creating message" });
    }
})

exports.message_update = asyncHandler(async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.messageId).exec();
        message.content = req.body.new_message;

        if (req.file) {
            const options = {
                public_id: message._id,
                overwrite: true,
              };              
            const image = await cloudinary.uploader.upload(req.file.path , options);
            message.image = image.secure_url;
        } else {
            message.image = null;
        }
        await message.save();

        const populatedMessage = await message.populate('user', 'display_name');

        res.json({ updated_message: populatedMessage, message: "message successfully updated"})
    } catch (err) {
        console.error(err);

        res.json({ message: "message could not be updated", error: err})
    }
})

exports.message_delete = asyncHandler(async (req, res, next) => {
    try {
        await Promise.all([
            cloudinary.uploader.destroy(req.params.messageId, function(result) { console.log(result) }),
            Conversation.findOneAndUpdate({ _id: req.body.conversation_id}, { $pull: { history: req.params.messageId } }).exec(),
            Message.findByIdAndDelete(req.params.messageId).exec()
        ])
        
        res.json({ message: "message successfully deleted" })
    } catch (err) {
        console.log(err);

        res.json({ message: "message could not be deleted", error: err})
    }
})