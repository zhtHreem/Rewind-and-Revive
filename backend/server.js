import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); 
import connectDB from './src/config/db.js';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import User from './src/models/user.js';
import Notification from './src/models/notifications.js';

import jwt from 'jsonwebtoken'; // ✅ ADD THIS

import FormData from 'form-data';

import userRoute from './src/routes/user.js'
import recommendationRoutes from './src/routes/recommendation.js';
import productRoute from './src/routes/product.js'
import bidRoute from './src/routes/biddingProduct.js'
import biddingRoute from './src/routes/bid.js'
import paymentRoute from './src/routes/payment.js'
import Chat from './src/models/chat.js';
import chatRoutes from './src/routes/chatRoutes.js';
import notificationRoutes from './src/routes/notifications.js';
import { createServer } from 'http';
import chatbotRoutes from './src/routes/chatbot.js';

const app = express();

connectDB();

console.log("api",process.env.REACT_APP_API_URL);

app.use(cors({
  origin: process.env.REACT_APP_API_URL,
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
}));

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*' );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
  });
});

app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  name: 'recommendSession',
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000, 
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

app.get('/api/debug/session', (req, res) => {
  res.json({
    sessionId: req.session.id,
    viewHistory: req.session.viewHistory || [],
    userViewHistory: req.session.userViewHistory || [],
    isAuthenticated: !!req.user
  });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.REACT_APP_API_URL, 
    methods: ["GET", "POST"],
  },
  transports: ['websocket', 'polling'], 
  withCredentials: true, 
});

// ✅ SOCKET.IO AUTH MIDDLEWARE
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication token missing"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    return next();
  } catch (err) {
    return next(new Error("Authentication failed"));
  }
});

const users = {};
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // ✅ Use verified user ID from token
  const userId = socket.user.id;
  users[userId] = socket.id;
  console.log(`Authenticated user ${userId} registered with socket ID: ${socket.id}`);

  socket.on('joinChat', ({ sender, receiver, product }) => {
    if (!sender || !receiver || !product) return;

    const chatRoom = `chat_${product}_${sender}_${receiver}`;
    socket.join(chatRoom);
    console.log(`User ${sender} joined chat room: ${chatRoom}`);
  });

  socket.on("sendMessage", async (message) => {
    const { sender, receiver, product, message: messageText } = message;

    // ✅ Check sender identity
    if (sender !== socket.user.id) {
      console.error("❌ Sender mismatch! Possible spoofing.");
      return;
    }

    if (!sender || !receiver || !messageText || !product) {
      console.error("❌ Error: Missing sender, receiver, or message content.");
      return;
    }

    try {
      let chat = await Chat.findOne({
        product: product,
        $or: [
          { buyer: sender, seller: receiver },
          { buyer: receiver, seller: sender }
        ]
      });

      if (!chat) {
        chat = new Chat({
          product: product,
          buyer: sender, 
          seller: receiver,
          messages: [],
        });
      }

      const newMessage = {
        sender,
        message: messageText,
        timestamp: new Date(),
      };

      chat.messages.push(newMessage);
      await chat.save();

      const receiverSocketId = users[receiver];
      const senderSocketId = users[sender];

      const fullMessage = {
        sender,
        receiver,
        product,
        message: messageText,
        timestamp: new Date(),
      };

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", fullMessage);
        console.log(`📤 Sent message to receiver (socket: ${receiverSocketId})`);
      }

      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", fullMessage);
        console.log(`📤 Sent message to sender (socket: ${senderSocketId})`);
      }

    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  });  

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    Object.keys(users).forEach((key) => {
      if (users[key] === socket.id) delete users[key];
    });
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ AUTH MIDDLEWARE FOR EXPRESS ROUTES
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ✅ PROTECT NOTIFICATION ROUTE
app.use('/api/notifications', authMiddleware, notificationRoutes);

app.use('/api/user', userRoute);
app.use('/api/product', productRoute);
app.use('/api/biddingProduct', bidRoute);
app.use('/api/bid', biddingRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/chats', chatRoutes);
app.use('/api/chat', chatbotRoutes);

// app.use(trackUserActivity);
app.use('/api', recommendationRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/', (req, res) => res.send('Hello World!'));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
