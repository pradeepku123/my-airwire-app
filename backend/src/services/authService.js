const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');

class AuthService {
    async register(username, password) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new AppError('Username already exists', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            password: hashedPassword,
        });

        return newUser;
    }

    async login(username, password, clientIp) {
        const user = await User.findOne({ username });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = jwt.sign({ id: user._id }, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn,
        });

        // Update user status
        user.isOnline = true;
        user.ipAddress = clientIp || user.ipAddress;
        await user.save();

        return { user, token };
    }
}

module.exports = new AuthService();
