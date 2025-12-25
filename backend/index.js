require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const socketHandler = require('./socket/socketHandler');
const logger = require('./utils/logger');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket Logic
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
});
