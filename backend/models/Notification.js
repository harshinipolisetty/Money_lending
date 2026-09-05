const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'borrow_request',
            'borrow_accepted',
            'borrow_rejected',
            'repayment_received',
            'repayment_approved',
            'repayment_rejected',
            'payment_due',
            'payment_recorded',
            'loan_logged',
            'loan_updated',
            'loan_deleted'
        ]
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        default: ''
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedTransaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }
}, {
    timestamps: true
});

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
