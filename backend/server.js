import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); 
import connectDB from './src/config/db.js';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import session from 'express-session';

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




io.on('connection', (socket) => {
  //console.log('A user connected');

  // Handle incoming chat messages
  // socket.on('sendMessage', (message) => {
  //     // Broadcast message to all connected clients including the sender
  //     io.emit('receiveMessage', message);
  //   //  console.log('Message sent:', message);
  // });
  

   socket.on('sendMessage', async (message) => {
    // Broadcast message to all connected clients including the sender
    io.emit('receiveMessage', message);
    
    try {
      // Find or create a notification for this message
      const sender = await User.findById(message.sender, 'username');
      
      let existingNotification = await Notification.findOne({
        recipient: message.receiver,
        sender: message.sender,
        product: message.product,
        type: 'message',
        isRead: false
      });
      
      if (existingNotification) {
        existingNotification.count += 1;
        existingNotification.description = `You have received ${existingNotification.count} new messages from ${sender.username}`;
        existingNotification.timestamp = Date.now();
        await existingNotification.save();
        
        io.emit('new_notification', {
          ...existingNotification.toObject(),
          title: 'New Message',
          time: 'Just now'
        });
      } else {
        const newNotification = new Notification({
          recipient: message.receiver,
          sender: message.sender,
          product: message.product,
          title: 'New Message',
          description: `You have received a new message from ${sender.username}`,
          type: 'message',
          count: 1
        });
        
        await newNotification.save();
        
        io.emit('new_notification', {
          ...newNotification.toObject(),
          title: 'New Message',
          time: 'Just now'
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  });


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
   // console.log('Test notification sent'); // Add this for debugging

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




app.use('/api/user', userRoute);
app.use('/api/product', productRoute);
app.use('/api/biddingProduct', bidRoute);
app.use('/api/bid', biddingRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/chats', chatRoutes); // Add chat routes here

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