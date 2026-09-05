const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const { emitToUser } = require('../socket');
const { fromPaise } = require('../utils/money');

const formatInr = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const startOfDay = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

const createNotification = async ({
    user,
    type,
    title,
    message = '',
    relatedTransaction = null
}) => {
    if (!user) return null;

    const notification = await Notification.create({
        user,
        type,
        title,
        message,
        relatedTransaction: relatedTransaction || undefined
    });

    const payload = notification.toObject();
    emitToUser(user.toString(), 'notification', payload);
    return notification;
};

exports.createNotification = createNotification;

exports.notifyUser = (payload) => {
    createNotification(payload).catch((error) => {
        console.error('In-app notification failed:', error.message);
    });
};

exports.listForUser = async (userId) => {
    await exports.ensureDueReminders(userId);
    return Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50);
};

exports.unreadCount = async (userId) => {
    await exports.ensureDueReminders(userId);
    return Notification.countDocuments({ user: userId, read: false });
};

exports.markRead = async (userId, notificationId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { read: true },
        { new: true }
    );
    if (!notification) {
        throw new Error('Notification not found');
    }
    return notification;
};

exports.markAllRead = async (userId) => {
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    return { success: true };
};

exports.ensureDueReminders = async (userId) => {
    const tomorrowStart = addDays(startOfDay(), 1);
    const dayAfter = addDays(tomorrowStart, 1);

    const dueSoon = await Transaction.find({
        owner: userId,
        dueDate: { $gte: tomorrowStart, $lt: dayAfter },
        status: { $in: ['active', 'pending_approval'] }
    });

    for (const tx of dueSoon) {
        const remaining = tx.remainingPaise != null
            ? fromPaise(tx.remainingPaise)
            : (tx.remainingAmount ?? tx.amount);
        if (!remaining) continue;

        const already = await Notification.findOne({
            user: userId,
            type: 'payment_due',
            relatedTransaction: tx._id,
            createdAt: { $gte: startOfDay() }
        });
        if (already) continue;

        const money = formatInr(remaining);
        const who = tx.friendName ? ` with ${tx.friendName}` : '';
        await createNotification({
            user: userId,
            type: 'payment_due',
            title: 'Payment due tomorrow',
            message: `${money} is due tomorrow${who}.`,
            relatedTransaction: tx._id
        });
    }
};

exports.formatInr = formatInr;
