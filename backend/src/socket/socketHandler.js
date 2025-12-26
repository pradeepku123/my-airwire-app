const User = require('../models/User');
const CallLog = require('../models/CallLog');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const config = require('../config');

const socketHandler = (io) => {
    // Middleware to verify token in socket connection
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("Authentication error"));

            const decoded = jwt.verify(token, config.jwtSecret);
            socket.user = decoded; // { id: ... }
            next();
        } catch (err) {
            logger.error(`Socket Auth Error: ${err.message}`);
            next(new Error("Authentication error"));
        }
    });

    const activeCalls = new Map(); // Store active call logs in memory or DB

    io.on('connection', async (socket) => {
        const userId = socket.user.id;
        logger.info(`User Connected: ${userId} (${socket.id})`);

        // Update socketId in DB
        await User.findByIdAndUpdate(userId, { socketId: socket.id, isOnline: true });

        // Broadcast updated user list
        const users = await User.find({ isOnline: true }).select('-password');
        io.emit('update_user_list', users);

        socket.on('disconnect', async () => {
            logger.info(`User Disconnected: ${socket.id}`);
            await User.findByIdAndUpdate(userId, { isOnline: false, socketId: '' });
            const users = await User.find({ isOnline: true }).select('-password');
            io.emit('update_user_list', users);

            socket.broadcast.emit("call_ended_signal", { from: userId });
        });

        socket.on("call_user", async (data) => {
            try {
                const targetUser = await User.findById(data.userToCall);
                if (targetUser && targetUser.socketId) {
                    io.to(targetUser.socketId).emit("call_user_incoming", {
                        signal: data.signalData,
                        from: data.from,
                        fromId: userId,
                        fromSocket: socket.id,
                        name: data.name,
                        callType: data.callType
                    });
                } else {
                    logger.warn(`Call failed: User ${data.userToCall} not found or offline`);
                }
            } catch (err) {
                logger.error(`Socket Call Error: ${err.message}`);
            }
        });

        // When call is accepted, create a log
        socket.on("answer_call", async (data) => {
            io.to(data.to).emit("call_accepted", data.signal);

            // Log call start
            // data.to is caller's socketId. We need to find the user.
            // But we don't have easy access to caller's UserID from just socketID here efficiently without looking up.
            // Ideally frontend sends caller ID, but we can look it up.
            try {
                const caller = await User.findOne({ socketId: data.to });
                if (caller) {
                    const newCall = await CallLog.create({
                        caller: caller._id,
                        receiver: userId,
                        startTime: new Date(),
                        status: 'ongoing'
                    });

                    // Store call ID for both sockets to update later
                    // Using a simple composite key or map
                    // For simplicity, we just log it created. 
                    // To update it properly on end_call, we'd need to track this 'newCall._id' with the socket.
                    socket.activeCallId = newCall._id;

                    // We also need to tell the caller about this Call ID? 
                    // Or we just look up the latest 'ongoing' call between these two users on end.
                }
            } catch (err) {
                logger.error(`Error logging call start: ${err.message}`);
            }
        });

        socket.on("ice_candidate", (data) => {
            io.to(data.to).emit("ice_candidate_incoming", data.candidate);
        });

        socket.on("reject_call", async (data) => {
            io.to(data.to).emit("call_rejected");

            // Log rejection if we want
            // For now, keeping simple
        });

        socket.on("end_call", async (data) => {
            io.to(data.to).emit("call_ended_signal", { from: userId });

            // Update Call Log
            try {
                // Find ongoing call involving this user
                // This is a naive approach; better to store callID in socket or client sends it.
                // We look for a call where this user is caller OR receiver And status is ongoing
                const call = await CallLog.findOne({
                    $or: [{ caller: userId }, { receiver: userId }],
                    status: 'ongoing'
                }).sort({ startTime: -1 });

                if (call) {
                    const now = new Date();
                    const duration = (now - call.startTime) / 1000;
                    call.endTime = now;
                    call.duration = duration;
                    call.status = 'completed';
                    await call.save();
                }
            } catch (err) {
                logger.error(`Error logging call end: ${err.message}`);
            }
        });
    });
};

module.exports = socketHandler;
