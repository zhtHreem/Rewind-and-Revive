// **chatRoutes.js**
import express from 'express';
import Chat from '../models/chat.js';
import Notification from '../models/notifications.js';
import User from '../models/user.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// **Fetch messages for a specific product, specific to a buyer**
/*router.get('/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id; // Authenticated user (either buyer or seller)

  try {
    // Find chats where the user is either the seller or a buyer
    const chats = await Chat.find({
      product: productId,
      $or: [{ buyer: userId }, { seller: userId }]
    })
      .populate('buyer', 'username')
      .populate('seller', 'username')
      .populate('messages.sender', 'username')
      .sort({ 'messages.timestamp': 1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});*/

router.get('/:productId/:buyerId/:sellerId', authMiddleware, async (req, res) => {
  const { productId, buyerId, sellerId } = req.params;

  try {
    // ✅ Find the chat for the specific buyer-seller pair
    const chat = await Chat.findOne({
      product: productId,
      buyer: buyerId,
      seller: sellerId
    })
    .populate('buyer', 'username')
    .populate('seller', 'username')
    .populate({
      path: 'messages.sender',
      select: 'username'
    });

    if (!chat) {
      console.log(`❌ Chat not found for product ${productId} between ${buyerId} and ${sellerId}`);
      return res.status(200).json({ messages: [] }); // Return empty messages instead of error
    }

    console.log(`✅ Chat found for product ${productId} between ${buyerId} and ${sellerId}`);
    res.status(200).json(chat);
  } catch (error) {
    console.error("❌ Error fetching chat:", error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});


// **Send a message**
router.post('/', authMiddleware, async (req, res) => {
  const { receiver, product, message } = req.body;
  const sender = req.user.id;

  if (!receiver || !product || !message) {
    return res.status(400).json({ error: "Receiver, product, and message are required" });
  }

  try {
    // Find or create a chat conversation between buyer and seller for the product
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
        buyer: sender,  // Assuming the sender is the buyer
        seller: receiver, // Receiver is the seller
        messages: []
      });
    }

    // Add the new message to the chat
    chat.messages.push({ sender, message });
    await chat.save();

    // Get sender information for notification
    const senderUser = await User.findById(sender, 'username');
    const receiverUser = await User.findById(receiver, 'username');

    // **Notification Logic (Unchanged)**
    let existingNotification = await Notification.findOne({
      recipient: receiver,
      sender: sender,
      product: product,
      type: 'message',
      isRead: false
    });

    if (existingNotification) {
      existingNotification.count += 1;
      existingNotification.description = `You have received ${existingNotification.count} new messages from ${senderUser.username}`;
      existingNotification.timestamp = Date.now();
      await existingNotification.save();

      if (req.io) {
        req.io.emit('new_notification', {
          ...existingNotification.toObject(),
          title: 'New Message',
          time: 'Just now'
        });
      }
    } else {
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

      if (req.io) {
        req.io.emit('new_notification', {
          ...newNotification.toObject(),
          time: 'Just now'
        });
      }
    }

    res.status(201).json(chat);
  } catch (error) {
    console.error('Message sending error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
