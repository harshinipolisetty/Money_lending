const borrowRequestService = require('../services/borrowRequest.service');

exports.createRequest = async (req, res, next) => {
    try {
        const { lenderId, amount, reason } = req.body;

        if (!lenderId || !amount || !reason) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }

        const request = await borrowRequestService.createBorrowRequest(
            req.user.userId,
            lenderId,
            amount,
            reason,
            req.body.dueDate
        );

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        if (error.message.includes('yourself') || error.message.includes('not found')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.getSentRequests = async (req, res, next) => {
    try {
        const requests = await borrowRequestService.getSentRequests(req.user.userId);
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

exports.getReceivedRequests = async (req, res, next) => {
    try {
        const requests = await borrowRequestService.getReceivedRequests(req.user.userId);
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

exports.acceptRequest = async (req, res, next) => {
    try {
        const request = await borrowRequestService.acceptRequest(req.params.id, req.user.userId);
        res.status(200).json({ success: true, message: 'Request accepted successfully', data: request });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Only pending')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.rejectRequest = async (req, res, next) => {
    try {
        const request = await borrowRequestService.rejectRequest(req.params.id, req.user.userId);
        res.status(200).json({ success: true, message: 'Request rejected successfully', data: request });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Only pending')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};
