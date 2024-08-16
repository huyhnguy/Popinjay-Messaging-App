const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  display_name: { type: String, required: true, maxLength: 100 },
  login: { 
    username: String,
    password: String,
    required: true
  },
  conversations: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
});

module.exports = mongoose.model("User", UserSchema);
