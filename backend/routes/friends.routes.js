const express = require('express');
const { getFriendSummary } = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/summary', protect, getFriendSummary);

module.exports = router;
