const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    friendName: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'Amount must be greater than 0']
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    note: {
        type: String
    },
    type: {
        type: String,
        enum: ['lent', 'borrowed'],
        required: true
    },
    otherUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    borrowRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BorrowRequest'
    },
    status: {
        type: String,
        enum: ['active', 'pending_approval', 'repaid'],
        default: 'active'
    },
    repaymentDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
