import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import http from 'http';
import {Server} from 'socket.io';
import wheelRouter from './routes/wheelRouter.js';

const DEV_PORT = 3001;
const DEV_DB_URL = 'mongodb://127.0.0.1:27017/wheelSpinner?gssapiServiceName=mongodb';
const PORT = process.env.PORT || DEV_PORT;
const mongoDB = process.env.MONGODB_URI || DEV_DB_URL;

const __dirname = path.resolve();

const app = express();

// Set up mongoose connection
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).catch(e => {
    console.error('Connection error', e.message);
});

app.use(express.json());

app.use(express.static(path.resolve(__dirname, './client/build')));

app.use('/api', wheelRouter);

app.use(function(request, response) {
    response.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Started on port ${PORT}`);
});

const io = new Server(server);

// Socket handling

// Admin emitted events
const ADMIN_ROOM = 'admin-room';
const DO_SPIN = 'admin-send-spin';
const SYNC_WHEEL_ROTATION = 'admin-sync-rotation';
const SYNC_WHEEL = 'admin-sync-wheel';
const ANNOUNCE_WINNER = 'admin-send-winner';
const ANNOUNCE_SPINNABLE = 'admin-send-spinnable';
const SEND_PONG = 'admin-send-pong';

// User emitted events
const USER_ROOM = 'user-room';
const REQUEST_SPIN = 'user-request-spin';
const REQUEST_ROTATION_SYNC = 'user-request-rotation';
const REQUEST_SPINNABLE = 'user-request-spinnable';
const REQUEST_PING = 'user-request-ping';

const adminRoom = (room) => `${room}-admin`;

io.on('connection', (socket) => {
    console.log('client connected');

    socket.on('disconnect', () => {
        console.log('client disconnected');
    });

    // Room events
    socket.on(ADMIN_ROOM, ({room}) => {
        socket.join(adminRoom(room));
    });

    socket.on(USER_ROOM, ({room}) => {
        socket.join(room);
    })

    // Admin emitted events
    socket.on(DO_SPIN, ({room, spin, wheel}) => {
        socket.to(room).emit(DO_SPIN, {spin, wheel});
    });

    socket.on(SYNC_WHEEL_ROTATION, ({room, rotation, userId}) => {
        const broadcastTo = userId || room;
        socket.to(broadcastTo).emit(SYNC_WHEEL_ROTATION, rotation);
    });

    socket.on(ANNOUNCE_SPINNABLE, ({room, spinnable, userId}) => {
        const broadcastTo = userId || room;
        socket.to(broadcastTo).emit(ANNOUNCE_SPINNABLE, spinnable);
    });

    socket.on(SYNC_WHEEL, ({room, wheel}) => {
        socket.to(room).emit(SYNC_WHEEL, wheel);
    });

    socket.on(ANNOUNCE_WINNER, ({room, winner, toRemove, futureWheel}) => {
        socket.to(room).emit(ANNOUNCE_WINNER, {winner, toRemove, futureWheel});
    });

    socket.on(SEND_PONG, ({room, userId}) => {
        const broadcastTo = userId || room;
        socket.to(broadcastTo).emit(SEND_PONG, {msg: 'pong'});
    });

    // User emitted events
    socket.on(REQUEST_SPIN, ({room}) => {
        socket.to(adminRoom(room)).emit(REQUEST_SPIN);
    });

    socket.on(REQUEST_ROTATION_SYNC, ({room}) => {
        socket.to(adminRoom(room)).emit(REQUEST_ROTATION_SYNC, {userId: socket.id});
    });

    socket.on(REQUEST_SPINNABLE, ({room}) => {
        socket.to(adminRoom(room)).emit(REQUEST_SPINNABLE, {userId: socket.id});
    });

    socket.on(REQUEST_PING, ({room}) => {
        socket.to(adminRoom(room)).emit(REQUEST_PING, {userId: socket.id});
    });
});