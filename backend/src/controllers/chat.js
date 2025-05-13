import Chat from '../models/chat.js';
import Notification from '../models/notifications.js';
import User from '../models/user.js';
import Product from '../models/product.js';
import mongoose from 'mongoose';

/**
 * Get chat messages between specific buyer and seller for a product
 * @route GET /api/chats/:productId/:buyerId/:sellerId
 * @access Private
 */
export const getChatMessages = async (req, res) => {
  const { productId, buyerId, sellerId } = req.params;

  try {
    // Validate all IDs are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(productId) || 
        (buyerId && !mongoose.Types.ObjectId.isValid(buyerId)) || 
        !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: 'Invalid ID format provided' });
    }

    // Security check: Ensure logged-in user is either the buyer or seller
    if (req.user.id !== buyerId && req.user.id !== sellerId) {
      return res.status(403).json({ error: 'Access denied. Not part of this chat.' });
    }

    // For empty buyer ID, just return empty messages
    if (!buyerId || buyerId === 'undefined' || buyerId === 'null' || buyerId === '') {
      return res.status(200).json({ 
        messages: [],
        buyer: null,
        seller: await User.findById(sellerId, 'username')
      });
    }

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
      // Return empty messages array if no chat exists yet
      return res.status(200).json({ 
        messages: [],
        buyer: await User.findById(buyerId, 'username'),
        seller: await User.findById(sellerId, 'username')
      });
    }

    // Mark related notifications as read when user opens the chat
    await Notification.updateMany(
      {
        recipient: req.user.id,
        sender: req.user.id === buyerId ? sellerId : buyerId,
        product: productId,
        type: 'message',
        isRead: false
      },
      { $set: { isRead: true } }
    );

    res.status(200).json(chat);
  } catch (error) {
    console.error("❌ Error fetching chat:", error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

/**
 * Send a chat message
 * @route POST /api/chats
 * @access Private
 */
export const sendMessage = async (req, res) => {
  const { receiverId, productId, message } = req.body;
  const senderId = req.user.id;
  
  if (!receiverId || !productId || !message) {
    return res.status(400).json({ error: "Receiver, product, and message are required" });
  }

  try {
    // Validate all IDs are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(productId) || 
        !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // Verify the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Determine buyer and seller roles
    let buyerId, sellerId;
    
    // If sender is the product owner, they're the seller
    if (product.owner.toString() === senderId) {
      sellerId = senderId;
      buyerId = receiverId;
    } else {
      // Sender is buyer, receiver is seller
      buyerId = senderId;
      sellerId = receiverId;
    }

    // Find or create a chat for this buyer-seller-product combination
    let chat = await Chat.findOne({
      product: productId,
      buyer: buyerId,
      seller: sellerId
    });

    if (!chat) {
      chat = new Chat({
        product: productId,
        buyer: buyerId,
        seller: sellerId,
        messages: []
      });
    }

    // Add the new message
    const newMessageObj = { 
      sender: senderId, 
      message,
      timestamp: new Date()
    };
    
    chat.messages.push(newMessageObj);
    await chat.save();

    // Create notification for receiver
    const senderUser = await User.findById(senderId, 'username');
    
    // Check for existing unread notification
    let existingNotification = await Notification.findOne({
      recipient: receiverId,
      sender: senderId,
      product: productId,
      type: 'message',
      isRead: false
    });

    // Update existing notification or create new one
    if (existingNotification) {
      existingNotification.count += 1;
      existingNotification.description = `You have received ${existingNotification.count} new messages from ${senderUser.username}`;
      existingNotification.timestamp = Date.now();
      await existingNotification.save();
      
      // Send notification through socket.io
      if (req.io) {
        req.io.to(receiverId).emit('new_notification', {
          ...existingNotification.toObject(),
          title: 'New Message',
          time: 'Just now'
        });
      }
    } else {
      const newNotification = new Notification({
        recipient: receiverId,
        sender: senderId,
        product: productId,
        title: 'New Message',
        description: `You have received a new message from ${senderUser.username}`,
        type: 'message',
        count: 1
      });
      
      await newNotification.save();
      
      // Send notification through socket.io
      if (req.io) {
        req.io.to(receiverId).emit('new_notification', {
          ...newNotification.toObject(),
          title: 'New Message',
          time: 'Just now'
        });
      }
    }

    // Get the latest message with populated sender information
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: 'messages.sender',
        select: 'username'
      });
    
    // Find the most recent message with the message id
    const lastMessageIndex = populatedChat.messages.length - 1;
    const lastMessage = populatedChat.messages[lastMessageIndex];
    
    // Prepare the socket message format with proper receiver field for filtering
    const socketMessage = {
      ...lastMessage.toObject(),
      product: productId,
      receiver: receiverId,
      sender: {
        _id: senderId,
        username: senderUser.username
      }
    };
    
    // Send message via socket.io to both participants
    if (req.io) {
      req.io.to(senderId).emit('receiveMessage', socketMessage);
      req.io.to(receiverId).emit('receiveMessage', socketMessage);
    }
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      messageData: lastMessage
    });
  } catch (error) {
    console.error('Message sending error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Get all chats for a user (either as buyer or seller)
 * @route GET /api/chats/user/all
 * @access Private
 */
export const getUserChats = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Find all chats where the user is either buyer or seller
    const chats = await Chat.find({
      $or: [
        { buyer: userId },
        { seller: userId }
      ]
    })
    .populate('buyer', 'username')
    .populate('seller', 'username')
    .populate('product', 'name images')
    .sort({ 'messages.timestamp': -1 });
    
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

/**
 * Get all buyers who have chatted with this seller about a specific product
 * @route POST /api/chats/product/buyers
 * @access Private
 */
export const getProductBuyers = async (req, res) => {
  const { productId } = req.body;
  const sellerId = req.user.id;
  
  // Debugging
  console.log("==== POST /product/buyers route hit ====");
  console.log("Product ID from body:", productId);
  console.log("Seller ID:", sellerId);
  
  try {
    // Validate product ID format
    if (!productId) {
      console.error("Missing product ID");
      return res.status(400).json({ error: 'Missing product ID' });
    }
    
    if (typeof productId !== 'string') {
      console.error("Invalid product ID type:", typeof productId);
      return res.status(400).json({ error: 'Invalid product ID format: not a string' });
    }
    
    // Trim productId in case there are whitespace issues
    const trimmedProductId = productId.trim();
    console.log("Trimmed Product ID:", trimmedProductId);
    console.log("Is valid ObjectId?", mongoose.Types.ObjectId.isValid(trimmedProductId));
    
    if (!mongoose.Types.ObjectId.isValid(trimmedProductId)) {
      console.error("Invalid MongoDB ObjectId format:", trimmedProductId);
      return res.status(400).json({ error: 'Invalid product ID format: not a valid MongoDB ObjectId' });
    }
    
    // Verify the product exists and belongs to this seller
    const product = await Product.findById(trimmedProductId);
    if (!product) {
      console.error("Product not found:", trimmedProductId);
      return res.status(404).json({ error: "Product not found" });
    }
    
    console.log("Product found:", product._id);
    console.log("Product owner:", product.owner);
    console.log("Current user:", sellerId);
    console.log("Is owner match?", product.owner.toString() === sellerId);
    
    // Only the product owner can see the list of buyers
    if (product.owner.toString() !== sellerId) {
      console.error("Access denied. User is not product owner");
      return res.status(403).json({ error: 'Access denied. You are not the owner of this product.' });
    }
    
    // Find all chats for this product where this user is the seller
    const chats = await Chat.find({
      product: trimmedProductId,
      seller: sellerId
    }).populate('buyer', 'username email profileImage');
    
    console.log(`Found ${chats.length} chats for this product`);
    
    // Extract unique buyers from chats with more defensive coding
    const buyers = chats
      .filter(chat => chat && chat.buyer) // Filter out any undefined/null buyers
      .map(chat => chat.buyer)
      .filter((buyer, index, self) => {
        if (!buyer || !buyer._id) return false;
        return index === self.findIndex(b => 
          b && b._id && buyer._id && b._id.toString() === buyer._id.toString()
        );
      });
    
    console.log(`Returning ${buyers.length} unique buyers`);
    res.status(200).json({ buyers });
  } catch (error) {
    console.error("Error fetching buyers:", error);
    res.status(500).json({ error: 'Failed to fetch buyers list: ' + error.message });
  }
};