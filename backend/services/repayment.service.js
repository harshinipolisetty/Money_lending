const RepaymentRequest = require('../models/RepaymentRequest');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { toPaise, fromPaise } = require('../utils/money');
const { notifyUser, formatInr } = require('./inAppNotification.service');

const populateFields = [
    { path: 'transaction' },
    { path: 'borrower', select: 'name email phone upiId qrCode' },
    { path: 'lender', select: 'name email phone upiId qrCode' }
];

const remainingPaiseOf = (tx) => {
    if (tx.status === 'repaid') return 0;
    if (tx.remainingPaise != null) return tx.remainingPaise;
    return toPaise(tx.remainingAmount ?? tx.amount) || 0;
};

exports.createRepaymentRequest = async (borrowerId, transactionId, note, amount) => {
    const transaction = await Transaction.findOne({
        _id: transactionId,
        owner: borrowerId
    });

    if (!transaction) {
        throw new Error('Transaction not found or unauthorized');
    }

    if (transaction.type !== 'borrowed') {
        throw new Error('Only borrowed transactions can be marked as paid');
    }

    if (transaction.status !== 'active') {
        throw new Error('Only active loans can request repayment approval');
    }

    if (!transaction.otherUser) {
        throw new Error('This transaction has no linked lender to approve repayment');
    }

    const existing = await RepaymentRequest.findOne({
        transaction: transactionId,
        status: 'pending'
    });
    if (existing) {
        throw new Error('A repayment request is already pending for this transaction');
    }

    const remainingPaise = remainingPaiseOf(transaction);
    const payPaise = amount != null && amount !== '' ? toPaise(amount) : remainingPaise;
    if (!payPaise) {
        throw new Error('Repayment amount must be greater than 0');
    }
    if (payPaise > remainingPaise) {
        throw new Error('Repayment cannot exceed the remaining balance');
    }

    const repayment = await RepaymentRequest.create({
        transaction: transaction._id,
        borrower: borrowerId,
        lender: transaction.otherUser,
        amount: fromPaise(payPaise),
        note
    });

    transaction.status = 'pending_approval';
    await transaction.save();

    const borrower = await User.findById(borrowerId);
    notifyUser({
        user: transaction.otherUser,
        type: 'repayment_received',
        title: `${formatInr(fromPaise(payPaise))} repayment received`,
        message: `${borrower?.name || 'A borrower'} sent a repayment request.`,
        relatedTransaction: transaction._id
    });
    notifyUser({
        user: borrowerId,
        type: 'payment_recorded',
        title: `${formatInr(fromPaise(payPaise))} repayment sent`,
        message: 'Waiting for the lender to approve.',
        relatedTransaction: transaction._id
    });

    return repayment.populate(populateFields);
};

exports.getPendingForLender = async (lenderId) => {
    return RepaymentRequest.find({ lender: lenderId, status: 'pending' })
        .populate(populateFields)
        .sort({ requestDate: -1 });
};

exports.getHistory = async (userId) => {
    return RepaymentRequest.find({
        $or: [{ borrower: userId }, { lender: userId }]
    })
        .populate(populateFields)
        .sort({ requestDate: -1 });
};

const linkedFilter = (transaction) =>
    transaction.borrowRequest
        ? { borrowRequest: transaction.borrowRequest }
        : {
            $or: [
                { _id: transaction._id },
                {
                    owner: transaction.otherUser,
                    otherUser: transaction.owner,
                    type: transaction.type === 'borrowed' ? 'lent' : 'borrowed',
                    status: { $in: ['active', 'pending_approval'] }
                }
            ]
        };

const applyApprovedPayment = async (transaction, payPaise) => {
    const docs = await Transaction.find(linkedFilter(transaction));
    for (const doc of docs) {
        const remainingPaise = remainingPaiseOf(doc);
        const paidPaise = doc.paidPaise != null ? doc.paidPaise : toPaise(doc.amountPaid || 0) || 0;
        const nextRemaining = Math.max(0, remainingPaise - payPaise);
        const nextPaid = paidPaise + Math.min(payPaise, remainingPaise);
        const fullyPaid = nextRemaining <= 0;
        doc.remainingPaise = nextRemaining;
        doc.paidPaise = nextPaid;
        doc.remainingAmount = fromPaise(nextRemaining);
        doc.amountPaid = fromPaise(nextPaid);
        doc.status = fullyPaid ? 'repaid' : 'active';
        doc.repaymentDate = fullyPaid ? new Date() : null;
        await doc.save();
    }
};

exports.approveRepayment = async (repaymentId, lenderId) => {
    const repayment = await RepaymentRequest.findOne({ _id: repaymentId, lender: lenderId });
    if (!repayment) {
        throw new Error('Repayment request not found or unauthorized');
    }
    if (repayment.status !== 'pending') {
        throw new Error('Only pending repayment requests can be approved');
    }

    const transaction = await Transaction.findById(repayment.transaction);
    if (!transaction) {
        throw new Error('Linked transaction not found');
    }

    const payPaise = toPaise(repayment.amount);
    if (!payPaise) {
        throw new Error('Invalid repayment amount');
    }

    repayment.status = 'approved';
    repayment.responseDate = Date.now();
    await repayment.save();

    await applyApprovedPayment(transaction, payPaise);

    notifyUser({
        user: repayment.borrower,
        type: 'repayment_approved',
        title: `${formatInr(repayment.amount)} repayment approved`,
        message: 'Your repayment was confirmed.',
        relatedTransaction: repayment.transaction
    });

    return repayment.populate(populateFields);
};

exports.rejectRepayment = async (repaymentId, lenderId) => {
    const repayment = await RepaymentRequest.findOne({ _id: repaymentId, lender: lenderId });
    if (!repayment) {
        throw new Error('Repayment request not found or unauthorized');
    }
    if (repayment.status !== 'pending') {
        throw new Error('Only pending repayment requests can be rejected');
    }

    repayment.status = 'rejected';
    repayment.responseDate = Date.now();
    await repayment.save();

    await Transaction.findByIdAndUpdate(repayment.transaction, {
        status: 'active',
        repaymentDate: null
    });

    notifyUser({
        user: repayment.borrower,
        type: 'repayment_rejected',
        title: `${formatInr(repayment.amount)} repayment was not approved`,
        message: 'Your repayment request was declined. The remaining balance is still due.',
        relatedTransaction: repayment.transaction
    });

    return repayment.populate(populateFields);
};
