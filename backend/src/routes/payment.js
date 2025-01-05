import express from "express";
import { addPayment} from "../controllers/payment.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create new payment
router.post("/add",authMiddleware, addPayment)


export default router;