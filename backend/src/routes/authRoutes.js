const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');

const authValidation = [
    body('username').notEmpty().withMessage('Username is required').trim().escape(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

router.post('/register', validate(authValidation), register);
router.post('/login', validate([
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
]), login);

module.exports = router;
