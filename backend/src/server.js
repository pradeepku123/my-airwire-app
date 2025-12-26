const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config');
const socketHandler = require('./socket/socketHandler');
const logger = require('./utils/logger');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket Logic
socketHandler(io);

// Server Listen
server.listen(config.port, () => {
    logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

// Handle unhandled Rejections
process.on('unhandledRejection', (err) => {
    logger.error(`UNHANDLED REJECTION! 💥 Shutting down...`);
    logger.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
