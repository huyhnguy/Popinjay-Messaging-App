const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  display_name: { type: String, maxLength: 100 },
  profile_picture: String,
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admin_permissions: {
    delete_messages: { type: Boolean, default: false },
    invite_users: { type: Boolean, default: true },
    kick_users: { type: Boolean, default: false }
  },
  master: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("Conversation", ConversationSchema);