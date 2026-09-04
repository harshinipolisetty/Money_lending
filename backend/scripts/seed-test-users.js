require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const User = require('../models/User');
const { generateUpiQrCode } = require('../utils/generateQRCode');

const TEST_USERS = [
    {
        name: 'Test Lender',
        email: 'lender@test.com',
        password: 'Test@12345',
        phone: '9876543210',
        upiId: 'lender@upi'
    },
    {
        name: 'Test Borrower',
        email: 'borrower@test.com',
        password: 'Test@12345',
        phone: '9876543211',
        upiId: 'borrower@upi'
    }
];

const seed = async () => {
    await connectDB();

    const salt = await bcrypt.genSalt(10);

    for (const account of TEST_USERS) {
        const hashedPassword = await bcrypt.hash(account.password, salt);
        const qrCode = await generateUpiQrCode(account.upiId, account.name);

        await User.findOneAndUpdate(
            { email: account.email },
            {
                name: account.name,
                email: account.email,
                password: hashedPassword,
                phone: account.phone,
                upiId: account.upiId,
                qrCode
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`Upserted ${account.email}`);
    }

    console.log('Test users ready.');
    process.exit(0);
};

seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
