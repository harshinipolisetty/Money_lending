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

const isAllowedOrigin = () => true;

app.use(cors({
    origin: true,
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

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`API reachable on this machine and LAN at http://<this-pc-ip>:${PORT}`);
});
