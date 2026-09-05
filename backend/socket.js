const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (httpServer, isAllowedOrigin) => {
    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || isAllowedOrigin(origin)) {
                    return callback(null, true);
                }
                return callback(null, false);
            },
            credentials: true
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error('Not authorized'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            return next();
        } catch (error) {
            return next(new Error('Not authorized'));
        }
    });

    io.on('connection', (socket) => {
        socket.join(`user:${socket.userId}`);
    });

    return io;
};

const emitToUser = (userId, event, payload) => {
    if (!io || !userId) return;
    io.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, emitToUser };
