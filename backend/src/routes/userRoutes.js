const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');

// Could add auth middleware here later
router.get('/users', getUsers);

module.exports = router;
