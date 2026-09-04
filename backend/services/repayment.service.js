const RepaymentRequest = require('../models/RepaymentRequest');
const Transaction = require('../models/Transaction');

const populateFields = [
    { path: 'transaction' },
    { path: 'borrower', select: 'name email phone upiId qrCode' },
    { path: 'lender', select: 'name email phone upiId qrCode' }
];

exports.createRepaymentRequest = async (borrowerId, transactionId, note) => {
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

    const repayment = await RepaymentRequest.create({
        transaction: transaction._id,
        borrower: borrowerId,
        lender: transaction.otherUser,
        amount: transaction.amount,
        note
    });

    transaction.status = 'pending_approval';
    await transaction.save();

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

const markLinkedTransactions = async (transaction, status, repaymentDate) => {
    const filter = transaction.borrowRequest
        ? { borrowRequest: transaction.borrowRequest }
        : {
            $or: [
                { _id: transaction._id },
                {
                    owner: transaction.otherUser,
                    otherUser: transaction.owner,
                    amount: transaction.amount,
                    type: transaction.type === 'borrowed' ? 'lent' : 'borrowed',
                    status: { $in: ['active', 'pending_approval'] }
                }
            ]
        };

    await Transaction.updateMany(filter, {
        status,
        repaymentDate: repaymentDate || null
    });
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

    repayment.status = 'approved';
    repayment.responseDate = Date.now();
    await repayment.save();

    await markLinkedTransactions(transaction, 'repaid', new Date());

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

    return repayment.populate(populateFields);
};
