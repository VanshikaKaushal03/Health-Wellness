const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Should be a practitioner or admin ID
    },
    subject: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    dateSent: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Add an index for faster lookup by user
messageSchema.index({ userId: 1 });

module.exports = mongoose.model('Message', messageSchema);