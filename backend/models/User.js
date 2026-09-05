const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String
    },
    upiId: {
        type: String
    },
    qrCode: {
        type: String
    },
    resetOtpHash: {
        type: String,
        select: false
    },
    resetOtpExpires: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
