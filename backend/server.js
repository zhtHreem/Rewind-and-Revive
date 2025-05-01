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


import FormData from 'form-data';

import userRoute from './src/routes/user.js'
import recommendationRoutes from './src/routes/recommendation.js';
import productRoute from './src/routes/product.js'
import bidRoute from './src/routes/biddingProduct.js'
import biddingRoute from './src/routes/bid.js'
import paymentRoute from './src/routes/payment.js'
import Chat from './src/models/chat.js';
import chatRoutes from './src/routes/chatRoutes.js'; // Import chat routes
// Add this import at the top with your other route imports
import notificationRoutes from './src/routes/notifications.js';

import { createServer } from 'http'; // Import to create HTTP server
import chatbotRoutes from './src/routes/chatbot.js'; // ✅ keep .js


const app = express();

connectDB();

console.log("api",process.env.REACT_APP_API_URL);

app.use(cors({
  origin: process.env.REACT_APP_API_URL,  // Use exact origin, not array
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true  // Ensure this is true
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*' );  // Change '*' to the allowed origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});


app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
  });
});


// Make sure your session configuration looks like this:
app.use(session({
  secret: 'your-secret-key',
  resave: true,               // Changed back to true for better compatibility
  saveUninitialized: true,
  name: 'recommendSession',   // Give it a specific name
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000, 
    httpOnly: true,
    secure: false,            // Keep false during development
    sameSite: 'lax'           // Add this to help with cross-site requests
  }
}));
// Add this to your routes
app.get('/api/debug/session', (req, res) => {
  res.json({
    sessionId: req.session.id,
    viewHistory: req.session.viewHistory || [],
    userViewHistory: req.session.userViewHistory || [],
    isAuthenticated: !!req.user
  });
});


const httpServer = createServer(app);

// Attach Socket.IO to the server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.REACT_APP_API_URL, 
    methods: ["GET", "POST"],
  },
  transports: ['websocket', 'polling'], 
   withCredentials: true, 
});

const users = {}; // Key: userId, Value: socketId
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Store user's socket ID when they connect
  socket.on('registerUser', (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
  });

  // ✅ Join a unique chat room for sender & receiver
  socket.on('joinChat', ({ sender, receiver, product }) => {
    if (!sender || !receiver || !product) return;

    const chatRoom = `chat_${product}_${sender}_${receiver}`;
    socket.join(chatRoom);
    console.log(`User ${sender} joined chat room: ${chatRoom}`);
  });

  // ✅ Send messages ONLY between sender & receiver
  socket.on("sendMessage", async (message) => {
    const { sender, receiver, product, message: messageText } = message;
  
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
  
      // Emit message to **BOTH** sender and receiver
      // ✅ Emit message directly to sender and receiver sockets
const receiverSocketId = users[receiver];
const senderSocketId = users[sender];

const fullMessage = {
  sender,
  receiver,
  product,
  message: messageText,
  timestamp: new Date(),
};

// Send to receiver (if online)
if (receiverSocketId) {
  io.to(receiverSocketId).emit("receiveMessage", fullMessage);
  console.log(`📤 Sent message to receiver (socket: ${receiverSocketId})`);
}

// Send to sender (for confirmation)
if (senderSocketId) {
  io.to(senderSocketId).emit("receiveMessage", fullMessage);
  console.log(`📤 Sent message to sender (socket: ${senderSocketId})`);
}

  
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  });  

  // ✅ Disconnect and remove user mapping
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




app.use('/api/user', userRoute);
app.use('/api/product', productRoute);
app.use('/api/biddingProduct', bidRoute);
app.use('/api/bid', biddingRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/chats', chatRoutes);
app.use('/api/chat', chatbotRoutes);

app.use('/api/notifications', notificationRoutes);
//app.use(trackUserActivity);
app.use('/api', recommendationRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/', (req, res) => res.send('Hello World!'));


// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for serverless environments
export default app;