const transactionService = require('../services/transaction.service');

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
    try {
        const { friendName, amount, date, note, type, otherUser } = req.body;
        
        if (!amount || !type || (!friendName && !otherUser)) {
            return res.status(400).json({ success: false, message: 'Please provide required fields' });
        }

        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }

        const data = {
            owner: req.user.userId,
            friendName,
            amount,
            date: date || Date.now(),
            note,
            type,
            otherUser
        };

        const transaction = await transactionService.createTransaction(data);
        
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;

        const query = {};
        if (req.query.type) {
            query.type = req.query.type;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.friendName) {
            query.friendName = new RegExp(req.query.friendName, 'i');
        }

        const result = await transactionService.getTransactions(req.user.userId, query, page, limit);

        res.status(200).json({
            success: true,
            data: result.transactions,
            pagination: {
                page: result.page,
                limit,
                total: result.total,
                totalPages: result.totalPages
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getTransactionsByType = async (req, res, next) => {
    try {
        const { type } = req.params;
        if (!['lent', 'borrowed'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid transaction type' });
        }
        const transactions = await transactionService.getTransactionsByType(req.user.userId, type);
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        next(error);
    }
};

exports.getTransactionsByFriend = async (req, res, next) => {
    try {
        const param = req.params.friendName;
        if (/^[a-fA-F0-9]{24}$/.test(param)) {
            const transaction = await transactionService.getTransactionById(param, req.user.userId);
            return res.status(200).json({ success: true, data: transaction });
        }

        const transactions = await transactionService.getTransactionsByFriend(
            req.user.userId,
            param
        );
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        if (error.message && error.message.includes('not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.getFriendSummary = async (req, res, next) => {
    try {
        const summary = await transactionService.getFriendSummary(req.user.userId);
        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
};
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
    try {
        const transaction = await transactionService.getTransactionById(req.params.id, req.user.userId);
        res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
    try {
        const { friendName, amount, date, note, type, status } = req.body;
        const updateData = { friendName, amount, date, note, type, status };
        
        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const transaction = await transactionService.updateTransaction(req.params.id, req.user.userId, updateData);
        
        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            data: transaction
        });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Cannot edit')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
    try {
        await transactionService.deleteTransaction(req.params.id, req.user.userId);
        res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Cannot delete')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};
