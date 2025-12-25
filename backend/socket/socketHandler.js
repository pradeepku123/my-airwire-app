const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const socketHandler = (io) => {
    // Middleware to verify token in socket connection
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("Authentication error"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            socket.user = decoded; // { id: ... }
            next();
        } catch (err) {
            logger.error(`Socket Auth Error: ${err.message}`);
            next(new Error("Authentication error"));
        }
    });

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
            const targetUser = await User.findById(data.userToCall);
            if (targetUser && targetUser.socketId) {
                io.to(targetUser.socketId).emit("call_user_incoming", {
                    signal: data.signalData,
                    from: data.from,
                    fromId: userId,
                    fromSocket: socket.id,
                    name: data.name
                });
            } else {
                logger.warn(`Call failed: User ${data.userToCall} not found or offline`);
            }
        });

        socket.on("answer_call", (data) => {
            io.to(data.to).emit("call_accepted", data.signal);
        });

        socket.on("ice_candidate", (data) => {
            io.to(data.to).emit("ice_candidate_incoming", data.candidate);
        });

        socket.on("reject_call", (data) => {
            // data.to contains the caller's socket ID or user ID. 
            // In our frontend code, `caller` state holds the socket ID of who called us.
            io.to(data.to).emit("call_rejected");
        });

        socket.on("end_call", (data) => {
            io.to(data.to).emit("call_ended_signal", { from: userId });
        });
    });
};

module.exports = socketHandler;
