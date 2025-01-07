import express from "express";
import { registerUser,loginUser,GoogleloginUser ,Userbadges } from "../controllers/user.js";
import { verifyEmail } from "../utils/emailVerificationUtils.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
// In routes/user.js
import { getUserProfile } from "../controllers/user.js";


// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

router.post("/google-login",GoogleloginUser)
router.post('/verify-email', verifyEmail);
router.get('/badges',authMiddleware, Userbadges);
//router.get('/profile/:id', authMiddleware, getUserProfile);
router.get('/profile/:id', authMiddleware, (req, res, next) => {
    console.log("✅ Backend: Reached the user profile route");
    next();  // Move to the actual controller function
}, getUserProfile);

export default router;