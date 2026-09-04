const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.searchUsers = async (query, currentUserId) => {
    const regex = new RegExp(query, 'i');
    return User.find({
        _id: { $ne: currentUserId },
        $or: [{ name: regex }, { email: regex }]
    })
        .select('name email phone upiId')
        .limit(10);
};

exports.getAllUsers = async (currentUserId) => {
    const users = await User.find({ _id: { $ne: currentUserId } })
        .select('name email phone upiId')
        .lean();

    const borrowingUserIds = await Transaction.distinct('owner', {
        type: 'borrowed',
        status: { $in: ['active', 'pending_approval'] }
    });
    const borrowingSet = new Set(borrowingUserIds.map((id) => id.toString()));

    return users.map((user) => ({
        ...user,
        availability: borrowingSet.has(user._id.toString())
            ? 'Currently Borrowing'
            : 'Available to Lend'
    }));
};
