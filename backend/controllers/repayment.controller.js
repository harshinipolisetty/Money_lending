const repaymentService = require('../services/repayment.service');

exports.requestRepayment = async (req, res, next) => {
    try {
        const { transactionId, note, amount } = req.body;
        if (!transactionId) {
            return res.status(400).json({ success: false, message: 'Transaction ID is required' });
        }

        const repayment = await repaymentService.createRepaymentRequest(
            req.user.userId,
            transactionId,
            note,
            amount
        );

        res.status(201).json({
            success: true,
            message: 'Repayment request submitted',
            data: repayment
        });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Only') || error.message.includes('already')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.getPending = async (req, res, next) => {
    try {
        const repayments = await repaymentService.getPendingForLender(req.user.userId);
        res.status(200).json({ success: true, data: repayments });
    } catch (error) {
        next(error);
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const repayments = await repaymentService.getHistory(req.user.userId);
        res.status(200).json({ success: true, data: repayments });
    } catch (error) {
        next(error);
    }
};

exports.approve = async (req, res, next) => {
    try {
        const repayment = await repaymentService.approveRepayment(req.params.id, req.user.userId);
        res.status(200).json({
            success: true,
            message: 'Repayment approved',
            data: repayment
        });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Only')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.reject = async (req, res, next) => {
    try {
        const repayment = await repaymentService.rejectRepayment(req.params.id, req.user.userId);
        res.status(200).json({
            success: true,
            message: 'Repayment rejected',
            data: repayment
        });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Only')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};
