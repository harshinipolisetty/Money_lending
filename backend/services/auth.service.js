const User = require('../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const { generateUpiQrCode } = require('../utils/generateQRCode');

const sanitizeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    upiId: user.upiId,
    qrCode: user.qrCode,
    createdAt: user.createdAt
});

exports.registerUser = async (userData) => {
    const { name, email, password, phone, upiId } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const qrCode = await generateUpiQrCode(upiId, name);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        upiId,
        qrCode
    });

    return {
        ...sanitizeUser(user),
        token: generateToken(user._id, user.email)
    };
};

exports.loginUser = async (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const plainPassword = String(password || '');
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (user && user.password && (await bcrypt.compare(plainPassword, user.password))) {
        return {
            ...sanitizeUser(user),
            token: generateToken(user._id, user.email)
        };
    }

    throw new Error('Invalid email or password');
};

exports.getUserProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return sanitizeUser(user);
};

exports.updateUpiDetails = async (userId, { phone, upiId }) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (phone !== undefined) {
        user.phone = phone;
    }
    if (upiId !== undefined) {
        user.upiId = upiId;
        user.qrCode = await generateUpiQrCode(upiId, user.name);
    }

    await user.save();
    return sanitizeUser(user);
};

exports.getPublicPaymentDetails = async (userId) => {
    const user = await User.findById(userId).select('name phone upiId qrCode');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};
