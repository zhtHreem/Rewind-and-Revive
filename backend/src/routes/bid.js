import express from "express";
const router = express.Router();
import { addBid, getBidsByProduct } from '../controllers/bid.js';

// POST /api/bids - Place a new bid
router.post('/', addBid);

// GET /api/bids/:productId - Get all bids for a specific product
router.get('/:id', getBidsByProduct);

export default router;
