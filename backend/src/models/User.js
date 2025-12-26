const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        default: ''
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    socketId: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
