import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); 
import connectDB from './src/config/db.js';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import cron from 'node-cron';
import { checkEndedAuctions } from './src/utils/auctionUtils.js';

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
    secure: false,            // Keep false during development
    sameSite: 'lax'           //  cross-site requests
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
 
  

   socket.on('authenticate', (userId) => {
    if (userId) {
      // Add this socket to a room named after the user ID
      socket.join(userId);
      console.log(`User ${userId} authenticated and joined room ${userId}`);
    }
  });



   socket.on('sendMessage', async (message) => {
    // Broadcast message to all connected clients including the sender
    io.emit('receiveMessage', message);
    

   // Handle sending messages with proper room targeting
  socket.on('sendMessage', async (messageData) => {
    try {
      const { senderId, receiverId, productId, message } = messageData;
      
      if (!senderId || !receiverId || !productId || !message) {
        console.error('Missing required message data');
        return;
      }
      
      // Create a unique chat room identifier for this conversation
      const chatRoomId = `chat_${productId}_${senderId}_${receiverId}`;
      
      // Get sender information for display
      const User = mongoose.model('User');
      const senderUser = await User.findById(senderId, 'username');
      
      const formattedMessage = {
        sender: {
          _id: senderId,
          username: senderUser?.username || 'Unknown'
        },
        message,
        timestamp: new Date(),
        product: productId
      };
      
      // Send message ONLY to the sender and receiver
      io.to(senderId).emit('receiveMessage', formattedMessage);
      io.to(receiverId).emit('receiveMessage', formattedMessage);
      
      console.log(`Message sent from ${senderId} to ${receiverId} for product ${productId}`);
      
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
    
  socket.on('product_purchased', async (data) => {
  const { buyerId, sellerId, productId } = data;
  
  try {
    // Find product and user information
    const product = await Product.findById(productId);
    const buyer = await User.findById(buyerId);
    const seller = await User.findById(sellerId);
    
    if (product && buyer && seller) {
      console.log(`Product ${product.name} purchased: buyer=${buyer.username}, seller=${seller.username}`);
    }
  } catch (error) {
    console.error('Error handling product purchase event:', error);
  }
});

  });


  // Example of sending a test notification
  socket.on('request_test_notification', () => {
    // This is a sample notification structure matching your Redux slice
    const testNotification = {
      id: Date.now(), // unique id
      title: 'Test Notification',
      description: 'This is a test notification from the backend',
      time: new Date().toLocaleTimeString(),
      isRead: false
    };




    // Broadcast the notification to all connected clients
    io.emit('new_notification', testNotification);

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
app.use('/api/chats', chatRoutes); 
app.use('/api/notifications', notificationRoutes);

app.use('/api', recommendationRoutes);

cron.schedule('* * * * *', async () => {
  try {
    await checkEndedAuctions(io);
    console.log('Checked for ended auctions');
  } catch (error) {
    console.error('Error checking ended auctions:', error);
  }
});

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