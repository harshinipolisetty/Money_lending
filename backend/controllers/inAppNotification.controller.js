const inAppNotificationService = require('../services/inAppNotification.service');

exports.list = async (req, res, next) => {
    try {
        const notifications = await inAppNotificationService.listForUser(req.user.userId);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

exports.unreadCount = async (req, res, next) => {
    try {
        const count = await inAppNotificationService.unreadCount(req.user.userId);
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        next(error);
    }
};

exports.markRead = async (req, res, next) => {
    try {
        const notification = await inAppNotificationService.markRead(req.user.userId, req.params.id);
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.markAllRead = async (req, res, next) => {
    try {
        await inAppNotificationService.markAllRead(req.user.userId);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};
