const BorrowRequest = require('../models/BorrowRequest');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { loanSnapshot } = require('../utils/money');
const { notifyBorrowRequest } = require('./notification.service');
const { notifyUser, formatInr } = require('./inAppNotification.service');

exports.createBorrowRequest = async (borrowerId, lenderId, amount, reason, dueDate) => {
    if (borrowerId.toString() === lenderId.toString()) {
        throw new Error('You cannot borrow from yourself');
    }

    const [borrower, lender] = await Promise.all([
        User.findById(borrowerId),
        User.findById(lenderId)
    ]);

    if (!lender) {
        throw new Error('Lender not found');
    }

    const request = await BorrowRequest.create({
        borrower: borrowerId,
        lender: lenderId,
        amount,
        reason,
        dueDate: dueDate || undefined
    });

    notifyUser({
        user: lenderId,
        type: 'borrow_request',
        title: `New borrow request from ${borrower?.name || 'a friend'}`,
        message: `${formatInr(amount)}${reason ? ` · ${reason}` : ''}`
    });

    notifyBorrowRequest({
        lender,
        borrower,
        amount,
        reason
    }).catch((error) => {
        console.error('Borrow-request notification failed:', error.message);
    });

    return request.populate([
        { path: 'borrower', select: 'name email' },
        { path: 'lender', select: 'name email phone' }
    ]);
};

exports.getSentRequests = async (borrowerId) => {
    return await BorrowRequest.find({ borrower: borrowerId })
        .populate('lender', 'name email')
        .sort({ createdAt: -1 });
};

exports.getReceivedRequests = async (lenderId) => {
    return await BorrowRequest.find({ lender: lenderId })
        .populate('borrower', 'name email upiId phone')
        .sort({ createdAt: -1 });
};

exports.acceptRequest = async (requestId, lenderId) => {
    const request = await BorrowRequest.findOne({ _id: requestId, lender: lenderId });

    if (!request) {
        throw new Error('Borrow request not found or unauthorized');
    }

    if (request.status !== 'pending') {
        throw new Error('Only pending requests can be accepted');
    }

    const borrower = await User.findById(request.borrower);
    const lender = await User.findById(lenderId);

    request.status = 'accepted';
    request.respondedAt = Date.now();
    await request.save();

    const snapshot = loanSnapshot(request.amount);

    notifyUser({
        user: request.borrower,
        type: 'borrow_accepted',
        title: `${lender?.name || 'Lender'} accepted your borrow request`,
        message: `${formatInr(request.amount)} is now on your borrower dashboard.`
    });

    await Transaction.create([
        {
            owner: lenderId,
            friendName: borrower?.name,
            otherUser: request.borrower,
            type: 'lent',
            status: 'active',
            borrowRequest: request._id,
            note: request.reason,
            date: Date.now(),
            dueDate: request.dueDate,
            ...snapshot
        },
        {
            owner: request.borrower,
            friendName: lender?.name,
            otherUser: lenderId,
            type: 'borrowed',
            status: 'active',
            borrowRequest: request._id,
            note: request.reason,
            date: Date.now(),
            dueDate: request.dueDate,
            ...snapshot
        }
    ]);

    return request;
};

exports.rejectRequest = async (requestId, lenderId) => {
    const request = await BorrowRequest.findOne({ _id: requestId, lender: lenderId });
        
    if (!request) {
        throw new Error('Borrow request not found or unauthorized');
    }

    if (request.status !== 'pending') {
        throw new Error('Only pending requests can be rejected');
    }

    request.status = 'rejected';
    request.respondedAt = Date.now();
    await request.save();

    const lender = await User.findById(lenderId);
    notifyUser({
        user: request.borrower,
        type: 'borrow_rejected',
        title: `${lender?.name || 'Lender'} declined your borrow request`,
        message: `${formatInr(request.amount)} was not approved.`
    });

    return request;
};
