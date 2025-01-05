import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

import FormData from 'form-data';
import userRoute from './src/routes/user.js'
import productRoute from './src/routes/product.js'
import bidRoute from './src/routes/biddingProduct.js'
import biddingRoute from './src/routes/bid.js'
import paymentRoute from './src/routes/payment.js'
import Chat from './src/models/chat.js';
import chatRoutes from './src/routes/chatRoutes.js'; // Import chat routes

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// **Socket.IO Integration in server.js**
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join product-specific chat room
  socket.on("joinChat", async ({ productId }) => {
    const roomName = `product-${productId}`;
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);

    try {
      const previousMessages = await Chat.find({ product: productId })
        .populate('sender', 'username')
        .populate('receiver', 'username')
        .sort({ timestamp: 1 });
      socket.emit("previousMessages", previousMessages);
    } catch (error) {
      console.error("Error fetching previous messages:", error);
      socket.emit("error", { message: "Failed to load previous messages." });
    }
  });

  // Handle sending a message
  socket.on("sendMessage", async (data) => {
    const { sender, receiver, product, message } = data;

    if (!sender || !receiver || !product || !message) {
      socket.emit("error", { message: "Invalid message data." });
      return;
    }

    try {
      const newMessage = await Chat.create({ sender, receiver, product, message });
      const roomName = `product-${product}`;
      io.to(roomName).emit("newMessage", newMessage);
    } catch (error) {
      socket.emit("error", { message: "Failed to send message." });
    }
  });



  
  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected');

  // Example of sending a test notification
  socket.on('request_test_notification', () => {
    // This is a sample notification structure matching your Redux slice
    const testNotification = {
      id: Date.now(), // unique id
    //  icon: 'CheckCircleOutlineIcon', // you might want to pass icon name or component
      title: 'Test Notification',
      description: 'This is a test notification from the backend',
      time: new Date().toLocaleTimeString(),
      isRead: false
    };




    // Broadcast the notification to all connected clients
    io.emit('new_notification', testNotification);
    console.log('Test notification sent'); // Add this for debugging

  });





   // Handle badge notifications
  socket.on('badge_unlocked', async (data) => {
    try {
      const notification = await createNotification({
        userId: data.userId,
        title: 'Badge Unlocked!',
        description: `Congratulations! You've earned the ${data.badge.name} badge`,
        type: 'badge',
        badgeData: data.badge
      });
      
      // Emit to specific user's room
      socket.emit('new_notification', notification);
    } catch (error) {
      console.error('Error creating badge notification:', error);
    }
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});




app.use((req, res, next) => {
  req.io = io;
  next();
});

const port = process.env.PORT || 5000;

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

app.use('/api/user', userRoute);
app.use('/api/product', productRoute);
app.use('/api/biddingProduct', bidRoute);
app.use('/api/bid', biddingRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/chats', chatRoutes); // Add chat routes here

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/', (req, res) => res.send('Hello World!'));

// Replace app.listen with server.listen
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Socket.IO server is running`);
});

// Export io for potential use in other files
export default { io, server };
