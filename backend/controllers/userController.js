const User = require('../models/User');
const logger = require('../utils/logger');

const getUsers = async (req, res) => {
    try {
        // Return online users
        const users = await User.find({ isOnline: true }).select('-password');
        res.json(users);
    } catch (err) {
        logger.error(`GetUsers Error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getUsers };
