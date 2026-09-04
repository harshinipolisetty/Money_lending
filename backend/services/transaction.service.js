const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

exports.createTransaction = async (data) => {
    return Transaction.create(data);
};

exports.getTransactions = async (userId, query, page, limit) => {
    const skip = (page - 1) * limit;
    const filter = { owner: userId, ...query };

    const transactions = await Transaction.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('otherUser', 'name email phone upiId');

    const total = await Transaction.countDocuments(filter);

    return {
        transactions,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

exports.getTransactionsByType = async (userId, type) => {
    return Transaction.find({ owner: userId, type })
        .sort({ date: -1, createdAt: -1 })
        .populate('otherUser', 'name email phone upiId');
};

exports.getTransactionsByFriend = async (userId, friendName) => {
    const regex = new RegExp(friendName, 'i');
    return Transaction.find({
        owner: userId,
        friendName: regex
    })
        .sort({ date: -1, createdAt: -1 })
        .populate('otherUser', 'name email phone upiId');
};

exports.getTransactionById = async (transactionId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        throw new Error('Transaction not found or unauthorized');
    }

    const transaction = await Transaction.findOne({ _id: transactionId, owner: userId })
        .populate('otherUser', 'name email phone upiId qrCode');

    if (!transaction) {
        throw new Error('Transaction not found or unauthorized');
    }
    return transaction;
};

exports.updateTransaction = async (transactionId, userId, updateData) => {
    const transaction = await Transaction.findOne({ _id: transactionId, owner: userId });

    if (!transaction) {
        throw new Error('Transaction not found or unauthorized');
    }

    if (transaction.borrowRequest) {
        throw new Error('Cannot edit a linked transaction created from a borrow request');
    }

    Object.assign(transaction, updateData);
    await transaction.save();
    return transaction;
};

exports.deleteTransaction = async (transactionId, userId) => {
    const transaction = await Transaction.findOne({ _id: transactionId, owner: userId });

    if (!transaction) {
        throw new Error('Transaction not found or unauthorized');
    }

    if (transaction.borrowRequest) {
        throw new Error('Cannot delete a linked transaction created from a borrow request');
    }

    await transaction.deleteOne();
    return true;
};

exports.getFriendSummary = async (userId) => {
    return Transaction.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: {
                    $toLower: {
                        $ifNull: ['$friendName', 'Unknown']
                    }
                },
                friendName: { $first: { $ifNull: ['$friendName', 'Unknown'] } },
                totalLent: {
                    $sum: { $cond: [{ $eq: ['$type', 'lent'] }, '$amount', 0] }
                },
                totalBorrowed: {
                    $sum: { $cond: [{ $eq: ['$type', 'borrowed'] }, '$amount', 0] }
                },
                outstandingLent: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$type', 'lent'] }, { $ne: ['$status', 'repaid'] }] },
                            '$amount',
                            0
                        ]
                    }
                },
                outstandingBorrowed: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$type', 'borrowed'] }, { $ne: ['$status', 'repaid'] }] },
                            '$amount',
                            0
                        ]
                    }
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                friendName: 1,
                totalLent: 1,
                totalBorrowed: 1,
                outstandingLent: 1,
                outstandingBorrowed: 1,
                net: { $subtract: ['$totalLent', '$totalBorrowed'] },
                count: 1
            }
        },
        { $sort: { friendName: 1 } }
    ]);
};
