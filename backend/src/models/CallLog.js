const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Not strictly required if missed call logic is complex, but good for now
        // For rejected calls, we might know the receiver
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // In seconds
        default: 0
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'missed', 'rejected'],
        default: 'ongoing'
    }
}, { timestamps: true });

module.exports = mongoose.model('CallLog', CallLogSchema);
