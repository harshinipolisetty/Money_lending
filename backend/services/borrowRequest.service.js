const BorrowRequest = require('../models/BorrowRequest');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { notifyBorrowRequest } = require('./notification.service');

exports.createBorrowRequest = async (borrowerId, lenderId, amount, reason) => {
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
        reason
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

    await Transaction.create([
        {
            owner: lenderId,
            friendName: borrower?.name,
            otherUser: request.borrower,
            amount: request.amount,
            type: 'lent',
            status: 'active',
            borrowRequest: request._id,
            note: request.reason,
            date: Date.now()
        },
        {
            owner: request.borrower,
            friendName: lender?.name,
            otherUser: lenderId,
            amount: request.amount,
            type: 'borrowed',
            status: 'active',
            borrowRequest: request._id,
            note: request.reason,
            date: Date.now()
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

    return request;
};
