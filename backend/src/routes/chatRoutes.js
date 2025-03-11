// // **chatRoutes.js**
// import express from 'express';
// import Chat from '../models/chat.js';
// import authMiddleware from '../middleware/authMiddleware.js';

// const router = express.Router();

// // Fetch messages for a specific product
// router.get('/:productId', authMiddleware, async (req, res) => {
//   const { productId } = req.params;
//   try {
//     const messages = await Chat.find({ product: productId })
//       .populate('sender', 'username')
//       .populate('receiver', 'username')
//       .sort({ timestamp: 1 });
//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch messages' });
//   }
// });

// // Send a message
// router.post('/', authMiddleware, async (req, res) => {
//   const { receiver, product, message } = req.body;
//   const sender = req.user.id;

//   if (!receiver || !product || !message) {
//     return res.status(400).json({ error: "Receiver, product, and message are required" });
//   }

//   try {
//     const newMessage = new Chat({ sender, receiver, product, message });
//     await newMessage.save();
//     res.status(201).json(newMessage);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to send message' });
//   }
// });

// export default router;



// src/routes/chatRoutes.js
import express from 'express';
import Chat from '../models/chat.js';
import Notification from '../models/notifications.js'; // Import the Notification model
import User from '../models/user.js'; // Import User model if not already imported
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Fetch messages for a specific product
router.get('/:productId/:buyerId', authMiddleware, async (req, res) => {
  const { productId, buyerId } = req.params;
  const sellerId = req.user.id; // Assuming seller is logged in

  try {
    const messages = await Chat.find({
      product: productId,
      $or: [
        { sender: buyerId, receiver: sellerId },
        { sender: sellerId, receiver: buyerId }
      ]
    })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});


// Send a message
router.post('/', authMiddleware, async (req, res) => {
  const { receiver, product, message } = req.body;
  // console.log('Message:', message); // Debug
  // console.log('Sender:', req.user.id); // Debug
  // console.log('Receiver:', receiver); // Debug
  const sender = req.user.id;
  // console.log('Product:', product); // Debug
  // console.log('Sender:', sender); // Debug

  if (!receiver || !product || !message) {
    return res.status(400).json({ error: "Receiver, product, and message are required" });
  }

  try {
    // Create and save the new message
    const newMessage = new Chat({ sender, receiver, product, message });
    await newMessage.save();
    
    // Get sender information for notification
    const senderUser = await User.findById(sender, 'username');
  //  console.log('Sender user:', senderUser); // Debug
    const receiverUser = await User.findById(receiver, 'username');
   // console.log('Receiver user:', receiverUser); // Debug
    
    // Check if there's an existing unread message notification from this sender for this product
    let existingNotification = await Notification.findOne({
      recipient: receiver,
      sender: sender,
      product: product,
      type: 'message',
      isRead: false
    });
    
    if (existingNotification) {
      // Update existing notification count
      existingNotification.count += 1;
      existingNotification.description = `You have received ${existingNotification.count} new messages from ${senderUser.username}`;
      existingNotification.timestamp = Date.now(); // Update timestamp
      await existingNotification.save();
      
      // Emit updated notification through socket if available
      if (req.io) {
        req.io.emit('new_notification', {
          ...existingNotification.toObject(),
          title: 'New Message',
          time: 'Just now'
        });
      }
    } else {
      // Create new notification
      const newNotification = new Notification({
        recipient: receiver,
        sender: sender,
        product: product,
        title: 'New Message',
        description: `You have received a new message from ${senderUser.username}`,
        type: 'message',
        count: 1
      });
      
      await newNotification.save();
      
      // Emit notification through socket if available
      if (req.io) {
        req.io.emit('new_notification', {
          ...newNotification.toObject(),
          time: 'Just now'
        });
      }
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Message sending error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;