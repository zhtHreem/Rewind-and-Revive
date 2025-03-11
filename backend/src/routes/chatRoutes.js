// **chatRoutes.js**
import express from 'express';
import Chat from '../models/chat.js';
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
  const sender = req.user.id;

  if (!receiver || !product || !message) {
    return res.status(400).json({ error: "Receiver, product, and message are required" });
  }

  try {
    const newMessage = new Chat({ sender, receiver, product, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;