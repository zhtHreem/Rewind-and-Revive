import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); 
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

// Attach Socket.IO to the server
const io = new Server(server, {
  cors: {
    origin: process.env.REACT_APP_API_URL, 
    methods: ["GET", "POST"],
  },
  transports: ['websocket', 'polling'], 
   withCredentials: true, 
});


io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming chat messages
  socket.on('sendMessage', (message) => {
      // Broadcast message to all connected clients including the sender
      io.emit('receiveMessage', message);
      console.log('Message sent:', message);
  });

  socket.on('disconnect', () => {
      console.log('User disconnected');
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
console.log("api",process.env.REACT_APP_API_URL);
app.use(cors({
  origin: [
    process.env.REACT_APP_API_URL,  // Development URL
  ],
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*' );  // Change '*' to the allowed origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});


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