const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getCallLogs } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/calls', getCallLogs);

module.exports = router;
