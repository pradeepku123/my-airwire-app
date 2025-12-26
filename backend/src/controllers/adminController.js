const User = require('../models/User');
const CallLog = require('../models/CallLog');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });

    // Calls today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const callsToday = await CallLog.countDocuments({
        startTime: { $gte: startOfDay }
    });

    const activeCalls = await CallLog.countDocuments({ status: 'ongoing' });

    res.json({
        totalUsers,
        onlineUsers,
        callsToday,
        activeCalls
    });
});

// @desc    Get all users with details
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    // Pagination
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 20;

    const count = await User.countDocuments({});
    const users = await User.find({})
        .select('-password')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ isOnline: -1, createdAt: -1 });

    res.json({ users, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get call logs
// @route   GET /api/admin/calls
// @access  Private/Admin
const getCallLogs = asyncHandler(async (req, res) => {
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = 20;

    const count = await CallLog.countDocuments({});
    const calls = await CallLog.find({})
        .populate('caller', 'username')
        .populate('receiver', 'username')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ startTime: -1 });

    res.json({ calls, page, pages: Math.ceil(count / pageSize) });
});

module.exports = {
    getDashboardStats,
    getAllUsers,
    getCallLogs
};
