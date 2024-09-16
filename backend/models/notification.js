const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    to: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }],
    from: { 
        type: Schema.Types.ObjectId, 
        refPath: 'from_type',
        required: true 
    },
    from_type: {
        type: String,
        enum: ['User', 'Conversation'],
        required: true
    },
    conversation_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation'
    },
    update: { 
        type: String, 
        required: true 
    },
    is_read: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);