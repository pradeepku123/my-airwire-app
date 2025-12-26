const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

const register = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    await authService.register(username, password);

    logger.info(`User registered: ${username}`);
    res.status(201).json({
        status: 'success',
        message: 'User registered successfully'
    });
});

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Extract IP
    let ipAddress = req.connection.remoteAddress;
    if (req.headers['x-forwarded-for']) {
        ipAddress = req.headers['x-forwarded-for'].split(',')[0];
    }

    const { user, token } = await authService.login(username, password, ipAddress);

    logger.info(`User logged in: ${username} (${ipAddress})`);

    res.status(200).json({
        status: 'success',
        token,
        user: {
            id: user._id,
            username: user.username,
            ipAddress: user.ipAddress
        }
    });
});

module.exports = { register, login };
