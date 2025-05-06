import express from 'express';
import { createPaymentIntent } from '../controllers/payment.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for creating a payment intent - requires authentication
router.post('/create-payment-intent', authMiddleware, createPaymentIntent);

export default router;