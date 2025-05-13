import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {  getChatMessages,  sendMessage,  getUserChats,getProductBuyers} from '../controllers/chat.js';

const router = express.Router();

// Get chat messages between specific buyer and seller for a product
router.get('/:productId/:buyerId/:sellerId', authMiddleware, getChatMessages);

// Send a message
router.post('/', authMiddleware, sendMessage);

// Get all chats for a user (either as buyer or seller)
router.get('/user/all', authMiddleware, getUserChats);

// Get all buyers who have chatted with this seller about a specific product
router.post('/product/buyers', authMiddleware, getProductBuyers);

export default router;