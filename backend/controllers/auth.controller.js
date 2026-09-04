const authService = require('../services/auth.service');

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword, phone, upiId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        const userData = await authService.registerUser({ name, email, password, phone, upiId });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: userData
        });
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(409).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const userData = await authService.loginUser(email, password);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: userData
        });
    } catch (error) {
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await authService.getUserProfile(req.user.userId);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUpi = async (req, res, next) => {
    try {
        const user = await authService.updateUpiDetails(req.user.userId, {
            phone: req.body.phone,
            upiId: req.body.upiId
        });
        res.status(200).json({
            success: true,
            message: 'Payment details updated',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserQr = async (req, res, next) => {
    try {
        const user = await authService.getPublicPaymentDetails(req.params.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};
