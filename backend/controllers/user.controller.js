const userService = require('../services/userService');

exports.searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }
        
        const users = await userService.searchUsers(q, req.user.userId);
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers(req.user.userId);
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};
