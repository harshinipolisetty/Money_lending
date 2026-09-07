const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const { initSocket } = require('./socket');

dotenv.config();
connectDB();

const app = express();

app.use(helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const extraOrigins = String(process.env.CLIENT_URL || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const allowedOrigins = new Set([
    ...extraOrigins,
    'http://localhost:4200',
    'http://localhost:4300',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://money-lending-one.vercel.app'
]);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.has(origin)) return true;
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return true;
    if (/^https:\/\/money-lending-one([a-z0-9-]+)?\.vercel\.app$/.test(origin)) return true;
    if (
        (process.env.NODE_ENV || 'development') !== 'production' &&
        /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/.test(origin)
    ) {
        return true;
    }
    return false;
};

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/borrow-requests', require('./routes/borrowRequest.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/repayments', require('./routes/repayment.routes'));
app.use('/api/friends', require('./routes/friends.routes'));
app.use('/api/notifications', require('./routes/inAppNotification.routes'));

app.get('/', (req, res) => {
    res.json({
        message: 'Money Lending Platform API',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server, isAllowedOrigin);

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
