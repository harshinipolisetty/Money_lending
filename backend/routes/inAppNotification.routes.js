const express = require('express');
const {
    list,
    unreadCount,
    markRead,
    markAllRead
} = require('../controllers/inAppNotification.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', list);
router.get('/unread-count', unreadCount);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);

module.exports = router;
