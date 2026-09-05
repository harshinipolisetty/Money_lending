const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { loanSnapshot, loanWithPayment, applyPaidTotal, toPaidPaise, fromPaise } = require('../utils/money');
const { notifyUser, formatInr } = require('./inAppNotification.service');

const linkedFilter = (transaction) =>
    transaction.borrowRequest
        ? { borrowRequest: transaction.borrowRequest }
        : { _id: transaction._id };

exports.createTransaction = async (data) => {
    const { amount, owner, friendName, date, note, type, otherUser, dueDate, amountPaid } = data;
    const money = amountPaid != null && amountPaid !== ''
        ? loanWithPayment(amount, amountPaid)
        : { ...loanSnapshot(amount), status: 'active', repaymentDate: null };

    const transaction = await Transaction.create({
        owner,
        friendName,
        date: date || Date.now(),
        note,
        type,
        otherUser,
        dueDate: dueDate || undefined,
        ...money
    });

    const paid = transaction.amountPaid || 0;
    const who = friendName || 'a friend';
    if (paid > 0) {
        notifyUser({
            user: owner,
            type: 'payment_recorded',
            title: `${formatInr(paid)} repayment received`,
            message: transaction.status === 'repaid'
                ? `Loan with ${who} is fully paid.`
                : `Payment logged on the ${type} loan with ${who}. Remaining ${formatInr(transaction.remainingAmount)}.`,
            relatedTransaction: transaction._id
        });
    } else {
        notifyUser({
            user: owner,
            type: 'loan_logged',
            title: type === 'lent' ? `You lent ${formatInr(amount)} to ${who}` : `You borrowed ${formatInr(amount)} from ${who}`,
            message: 'Saved in your transactions.',
            relatedTransaction: transaction._id
        });
    }

    return transaction;
};

exports.getTransactions = async (userId, query, page, limit, sort = {}) => {
    const skip = (page - 1) * limit;
    const filter = { owner: userId, ...query };

    const sortFields = { date: 'date', amount: 'amount', dueDate: 'dueDate', createdAt: 'createdAt' };
    const sortBy = sortFields[sort.sort] || 'date';
    const sortDir = sort.order === 'asc' ? 1 : -1;

    const transactions = await Transaction.find(filter)
        .sort({ [sortBy]: sortDir, createdAt: -1 })
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

    const previousPaidPaise = transaction.paidPaise != null
        ? transaction.paidPaise
        : toPaidPaise(transaction.amountPaid || 0);
    const wantsPayment = updateData.amountPaid !== undefined && updateData.amountPaid !== '';
    const wantsPrincipal = updateData.amount !== undefined;
    const details = {};
    ['friendName', 'date', 'note', 'type', 'dueDate'].forEach((key) => {
        if (updateData[key] !== undefined) {
            details[key] = updateData[key] === '' ? null : updateData[key];
        }
    });

    if (transaction.borrowRequest) {
        const locked = ['friendName', 'type'].some((key) => details[key] !== undefined)
            || wantsPrincipal;
        if (locked) {
            throw new Error('Linked loans can only update payment received, note, or due date');
        }
    }

    Object.assign(transaction, details);

    if (wantsPrincipal) {
        const paid = wantsPayment ? updateData.amountPaid : (transaction.amountPaid || 0);
        Object.assign(transaction, loanWithPayment(updateData.amount, paid));
        await transaction.save();
        notifyTransactionEdited(transaction, previousPaidPaise, [transaction]);
        return transaction;
    }

    if (wantsPayment) {
        const paidPaise = toPaidPaise(updateData.amountPaid);
        const docs = await Transaction.find(linkedFilter(transaction));
        for (const doc of docs) {
            applyPaidTotal(doc, paidPaise);
            if (doc._id.equals(transaction._id)) {
                Object.assign(doc, details);
            }
            await doc.save();
        }
        const updated = await Transaction.findById(transaction._id);
        notifyTransactionEdited(updated, previousPaidPaise, docs);
        return updated;
    }

    await transaction.save();
    notifyTransactionEdited(transaction, previousPaidPaise, [transaction]);
    return transaction;
};

const friendLabel = (tx) => tx?.friendName || 'a friend';

const notifyTransactionEdited = (transaction, previousPaidPaise, linkedDocs = [transaction]) => {
    if (!transaction) return;

    const nextPaidPaise = transaction.paidPaise != null
        ? transaction.paidPaise
        : toPaidPaise(transaction.amountPaid || 0);
    const deltaPaise = nextPaidPaise - (previousPaidPaise || 0);
    const who = friendLabel(transaction);
    const seen = new Set();
    const targets = deltaPaise !== 0 ? linkedDocs : [transaction];

    for (const doc of targets) {
        const uid = doc.owner?.toString();
        if (!uid || seen.has(uid)) continue;
        seen.add(uid);

        if (deltaPaise > 0) {
            notifyUser({
                user: doc.owner,
                type: 'payment_recorded',
                title: `${formatInr(fromPaise(deltaPaise))} repayment received`,
                message: transaction.status === 'repaid'
                    ? `Loan with ${friendLabel(doc)} is fully paid.`
                    : `Payment updated with ${friendLabel(doc)}. Remaining ${formatInr(doc.remainingAmount)}.`,
                relatedTransaction: doc._id
            });
            continue;
        }

        if (deltaPaise < 0) {
            notifyUser({
                user: doc.owner,
                type: 'loan_updated',
                title: `Payment edited with ${friendLabel(doc)}`,
                message: `Amount paid is now ${formatInr(doc.amountPaid || 0)}. Remaining ${formatInr(doc.remainingAmount)}.`,
                relatedTransaction: doc._id
            });
            continue;
        }

        notifyUser({
            user: doc.owner,
            type: 'loan_updated',
            title: `You edited the loan with ${who}`,
            message: `${formatInr(transaction.principalAmount || transaction.amount)} ${transaction.type} loan was updated.`,
            relatedTransaction: transaction._id
        });
    }
};

exports.deleteTransaction = async (transactionId, userId) => {
    const transaction = await Transaction.findOne({ _id: transactionId, owner: userId });

    if (!transaction) {
        throw new Error('Transaction not found or unauthorized');
    }

    if (transaction.borrowRequest) {
        throw new Error('Cannot delete a linked transaction created from a borrow request');
    }

    const who = friendLabel(transaction);
    const amount = transaction.principalAmount || transaction.originalAmount || transaction.amount;
    await transaction.deleteOne();

    notifyUser({
        user: userId,
        type: 'loan_deleted',
        title: `You deleted a ${transaction.type} loan`,
        message: `${formatInr(amount)} with ${who} was removed.`
    });

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
                            { $ifNull: ['$remainingAmount', '$amount'] },
                            0
                        ]
                    }
                },
                outstandingBorrowed: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$type', 'borrowed'] }, { $ne: ['$status', 'repaid'] }] },
                            { $ifNull: ['$remainingAmount', '$amount'] },
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
