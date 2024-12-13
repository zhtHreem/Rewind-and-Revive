import express from "express";
import { registerUser,loginUser,GoogleloginUser  } from "../controllers/user.js";
import { verifyEmail } from "../utils/emailVerificationUtils.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

router.post("/google-login",GoogleloginUser)
router.post('/verify-email', verifyEmail);


export default router;
