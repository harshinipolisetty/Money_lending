const express = require('express');
const { register, login, getProfile, updateUpi, getUserQr } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getProfile);
router.put('/profile/upi', protect, updateUpi);
router.get('/user/:id/qr', protect, getUserQr);

module.exports = router;
