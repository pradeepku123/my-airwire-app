const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
    // Return online users
    const users = await User.find({ isOnline: true }).select('-password');
    res.json({
        status: 'success',
        results: users.length,
        data: users
    });
});

module.exports = { getUsers };
