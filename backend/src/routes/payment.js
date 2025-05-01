import express from "express";
import { createPaymentIntent} from "../controllers/payment.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create new payment create-payment-intent
// router.post("/add",authMiddleware, addPayment)

router.post("/create-payment-intent",authMiddleware, createPaymentIntent)
export default router;