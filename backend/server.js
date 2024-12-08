import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import FormData from 'form-data';
import userRoute from './src/routes/user.js';
import productRoute from './src/routes/product.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
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

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const port = process.env.PORT || 5000;

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/api/user', userRoute);
app.use('/api/product', productRoute);

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
export { io };