const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  to: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resourceId: { type: String, required: true },
  type: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);