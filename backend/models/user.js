const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  display_name: { type: String, required: true, maxLength: 30 },
  login: { 
    username: String,
    password: String,
  },
  conversations: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  profile_picture: String,
  about_me: { type: String, maxLength: 150 }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
