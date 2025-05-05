import express from "express";
const router = express.Router();
import { addBid, getBidsByProduct } from '../controllers/bid.js';
import authMiddleware from "../middleware/authMiddleware.js";

router.post('/',authMiddleware, addBid);

router.get('/:id', getBidsByProduct);

export default router;
