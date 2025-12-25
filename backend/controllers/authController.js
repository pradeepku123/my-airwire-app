const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ msg: 'Missing fields' });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ msg: 'Username already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();
        logger.info(`User registered: ${username}`);
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        logger.error(`Register Error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Basic IP extraction
        let ipAddress = req.connection.remoteAddress;
        if (req.headers['x-forwarded-for']) {
            ipAddress = req.headers['x-forwarded-for'].split(',')[0];
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

        // Update user status
        user.isOnline = true;
        user.ipAddress = ipAddress;
        await user.save();

        logger.info(`User logged in: ${username} (${ipAddress})`);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                ipAddress
            }
        });
    } catch (err) {
        logger.error(`Login Error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login };
