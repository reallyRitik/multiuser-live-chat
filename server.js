const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const messageSchema = new mongoose.Schema({
  sender: String,  // 'user' or 'admin'
  text: String,
  userId: String,
  replyTo: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

const userSockets = new Map(); // userId => socket
const unreadCount = new Map(); // userId => number

io.on('connection', (socket) => {
  const role = socket.handshake.query.role || 'user';

  if (role === 'user') {
    const userId = socket.id;
    userSockets.set(userId, socket);
    socket.join('user_' + userId);

    io.to('admins').emit('user connected', { userId, unread: unreadCount.get(userId) || 0 });

    Message.find({ userId }).sort({ createdAt: 1 }).then(history => {
      socket.emit('chat history', history);
    });

    socket.on('chat message', async (text, callback) => {
      const msg = new Message({ sender: 'user', text, userId });
      await msg.save();

      unreadCount.set(userId, (unreadCount.get(userId) || 0) + 1);

      io.to('admins').emit('chat message', msg, { unreadCount: unreadCount.get(userId) });
      socket.emit('chat message', msg);

      if (callback) callback(msg._id.toString());
    });

    socket.on('disconnect', () => {
      userSockets.delete(userId);
      unreadCount.delete(userId);
      io.to('admins').emit('user disconnected', { userId });
    });
  }

  if (role === 'admin') {
    socket.join('admins');

    const usersData = Array.from(userSockets.keys()).map(userId => ({
      userId,
      unread: unreadCount.get(userId) || 0,
    }));
    socket.emit('users list', usersData);

    socket.on('admin message', async ({ text, userId, replyTo }) => {
      if (!userSockets.has(userId)) {
        socket.emit('error', `User ${userId} not connected`);
        return;
      }
      const msg = new Message({ sender: 'admin', text, userId, replyTo: replyTo || null });
      await msg.save();

      unreadCount.set(userId, 0);

      io.to('user_' + userId).emit('chat reply', msg);
      io.to('admins').emit('chat reply', msg, { userId, unreadCount: 0 });
    });

    socket.on('read user', (userId) => {
      unreadCount.set(userId, 0);
      io.to('admins').emit('reset unread', userId);
    });
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
