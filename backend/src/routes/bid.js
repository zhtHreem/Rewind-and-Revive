import express from "express";
const router = express.Router();
import { addBid, getBidsByProduct } from '../controllers/bid.js';

router.post('/', addBid);

router.get('/:id', getBidsByProduct);

export default router;
