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
    amountPaise: {
        type: Number,
        min: 1
    },
    originalAmount: {
        type: Number
    },
    principalAmount: {
        type: Number
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number
    },
    paidPaise: {
        type: Number,
        default: 0
    },
    remainingPaise: {
        type: Number
    },
    dueDate: {
        type: Date
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

transactionSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.principalAmount = ret.principalAmount ?? ret.originalAmount ?? ret.amount;
        ret.amountPaid = ret.amountPaid ?? 0;
        if (ret.status === 'repaid') {
            ret.remainingAmount = 0;
        } else {
            ret.remainingAmount = ret.remainingAmount ?? ret.principalAmount;
        }
        return ret;
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
