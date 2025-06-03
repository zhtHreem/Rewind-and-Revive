import User from "../models/user.js";
import mongoose from "mongoose";
import Notification from '../models/notifications.js';
import Product from '../models/product.js';

import Payment from "../models/payment.js";
import { generateToken } from "../utils/jwtUtils.js";
import { OAuth2Client } from 'google-auth-library';
import { sendVerificationEmail } from "../utils/emailVerificationUtils.js";
import { checkAndUpdateBadges } from '../utils/badgeService.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res) => {
  console.log("Registration request body:", req.body);
  const { username, email, password } = req.body;

  try {
    // Check for existing users with the same email or username
    const existingUser = await User.findOne({ 
      $or: [
        { email },  // Check if email exists
        { username } // Check if username exists
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists", 
        field: existingUser.email === email ? 'email' : 'username'
      });
    }

    // Create new user
    const newUser = new User({ 
      username, 
      email, 
      password,
      isEmailVerified: false,  // Explicitly set to false
    });

    try {
      // Save the user to the database
      const savedUser = await newUser.save();

      // Send verification email (make sure the function works as expected)
      const emailSent = await sendVerificationEmail(savedUser);

      if (!emailSent) {
        return res.status(500).json({
          message: 'User created, but verification email could not be sent',
          user: {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email
          }
        });
      }

      // Successfully created and sent email
      return res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        user: {
          id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email
        }
      });
      
    } catch (saveError) {
      console.error("User Save Error:", saveError);

      if (saveError.code === 11000) {
        // Handle unique constraint violation (email or username)
        const duplicateField = Object.keys(saveError.keyValue)[0];
        return res.status(409).json({
          message: `${duplicateField} already exists`,
          duplicateField
        });
      }

      return res.status(500).json({
        message: 'Error creating user',
        error: saveError.message
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

   const token = generateToken(user);
    res.status(200).json({  token,});
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const GoogleloginUser = async (req, res) => {
    console.log("Google Login Request Started");
    const { token } = req.body;

    try {
        // Verify the token
        const ticket = await client.verifyIdToken({  idToken: token,  audience: process.env.GOOGLE_CLIENT_ID });

        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        console.log("Payload Details:", {   email,  name,  googleId: sub });

        // Check if user exists in your database
        let user = await User.findOne({ 
            $or: [
                { googleId: sub },
                { email: email }
            ]
        });

        console.log("Existing User Check:", user);

        if (!user) {
            // If the user doesn't exist, create a new user with Google login
            const newUser = new User({ username: name, email: email, googleId: sub   });

            try {
                // Attempt to save new user
                const savedUser = await newUser.save();
                const token = generateToken(savedUser);
                console.log("User Save Attempt Result:", {  savedUser, savedSuccessfully: true });
                console.log("s",token)
                // Respond with saved user
                return res.status(201).json({
                    message: 'User created successfully',
                    user: savedUser,
                    token
                });
            } catch (saveError) {
                console.error("User Save Error:", saveError);

                // Check for validation or duplicate key error
                if (saveError.name === 'ValidationError') {
                    return res.status(400).json({
                        message: 'Validation Error',
                        errors: saveError.errors
                    });
                }
                if (saveError.code === 11000) {
                    return res.status(409).json({
                        message: 'User already exists',
                        duplicateFields: saveError.keyValue
                    });
                }

                // Generic error response
                return res.status(500).json({
                    message: 'Error creating user',
                    error: saveError.message
                });
            }
        } else {
            // If the user already exists, check if Google ID is linked
            if (!user.googleId) {
                // User exists but Google is not linked, link the Google account
                user.googleId = sub; // Link the Google ID
                await user.save();  // Save the updated user
                const token = generateToken(user);
                return res.status(200).json({
                    message: 'Google account linked successfully!',
                    user,
                    token
                });
            }

            // If Google ID is already linked, proceed normally
            const token = generateToken(user);
            return res.status(200).json({
                message: 'Login successful!',
                user,
                token
            });
        }
    } catch (error) {
        console.error("Complete Google Login Error:", error);

        res.status(400).json({ 
            message: 'Invalid Google token', 
            error: error.message 
        });
    }
}



export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch product stats
    const totalListed = await Product.countDocuments({ owner: id });
    const productsSold = await Product.countDocuments({ owner: id, isSold: true });

    // Calculate total earned (sum of all payments where this user is the product owner)
    const earnings = await Payment.aggregate([
      { $match: { productOwner: new mongoose.Types.ObjectId(id) }},
      { $group: { _id: null, totalEarned: { $sum: "$amount" }}}
    ]);
    
    // Calculate total spent (sum of all payments where this user is the buyer)
    const spending = await Payment.aggregate([
      { $match: { productBuyers: new mongoose.Types.ObjectId(id) }},
      { $group: { _id: null, totalSpent: { $sum: "$amount" }}}
    ]);

    // Items bought count
    const itemsBought = await Payment.countDocuments({ productBuyers: id });

    // Extract the values or default to 0 if no records found
    const totalEarned = earnings.length > 0 ? earnings[0].totalEarned : 0;
    const totalSpent = spending.length > 0 ? spending[0].totalSpent : 0;

    // Build the stats object
    const stats = {
      productsSold,
      totalListed,
      itemsBought,
      totalSpent,
      totalEarned,
      likesReceived: user.likesReceived || 0
    };

    // Update the user's stats in the database
    await User.findByIdAndUpdate(id, { stats }, { new: true });
    
    // === Calculate Top Seller Rank ===
    const allSellers = await User.find({ role: 'seller' });

    const sellerScores = allSellers.map(seller => {
      const s = seller.stats || {};
      const score =
        (s.productsSold || 0) * 0.4 +
        (seller.averageRating || 0) * 20 * 0.3 +
        (s.totalEarned || 0) * 0.2 +
        ((seller.reviewsData?.fiveStar || 0) +
         (seller.reviewsData?.fourStar || 0) +
         (seller.reviewsData?.threeStar || 0) +
         (seller.reviewsData?.twoStar || 0) +
         (seller.reviewsData?.oneStar || 0)) * 0.1;

      return { id: seller._id.toString(), score };
    });

    sellerScores.sort((a, b) => b.score - a.score);
    const rank = sellerScores.findIndex(s => s.id === id) + 1;
    const topSellerRank = ((rank / sellerScores.length) * 100).toFixed(1);

    res.status(200).json({
      ...user.toObject(),
      stats,
      reviewsData: user.reviewsData,
      topSellerRank
    });

  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Update average rating

export const updateAverageRating = async (req, res) => {
  try {
    // Use req.params.id or req.user.id depending on your route
    const userId = req.params.id || req.user.id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate average rating
    const { fiveStar, fourStar, threeStar, twoStar, oneStar } = user.reviewsData;
    const totalReviews = fiveStar + fourStar + threeStar + twoStar + oneStar;
    
    if (totalReviews === 0) {
      user.averageRating = 0;
    } else {
      const weightedSum = (5 * fiveStar) + (4 * fourStar) + (3 * threeStar) + (2 * twoStar) + (1 * oneStar);
      user.averageRating = weightedSum / totalReviews;
    }
    
    await user.save();
    
    // After updating rating, check if any badges should be awarded
    if (req.io) {
      await checkAndUpdateBadges(userId, req.io);
    }
    
    return res.status(200).json({ 
      message: 'Average rating updated successfully',
      averageRating: user.averageRating 
    });
  } catch (error) {
    console.error('Error updating average rating:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitReview = async (req, res) => {
  try {
    // console.log("Incoming request body:", req.body);

    const { userId, rating } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({ message: "User ID and rating are required." });
    }

    if (![1, 2, 3, 4, 5].includes(rating)) {
      return res.status(400).json({ message: "Invalid rating. Rating must be between 1 and 5." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure `reviews` exists before updating
    if (!user.reviewsData) {
      user.reviewsData = { fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0 };
    }

    // console.log("Before update:", user.reviewsData);

    // Increment the corresponding star rating
    switch (rating) {
      case 5:
        user.reviewsData.fiveStar += 1;
        break;
      case 4:
        user.reviewsData.fourStar += 1;
        break;
      case 3:
        user.reviewsData.threeStar += 1;
        break;
      case 2:
        user.reviewsData.twoStar += 1;
        break;
      case 1:
        user.reviewsData.oneStar += 1;
        break;
    }

    // console.log("After update:", user.reviewsData);

    user.markModified("reviews"); 
    await user.save();
    res.status(200).json({ message: "Review submitted successfully", reviews: user.reviewsData });

  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const Userbadges = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Use our refactored function
    const result = await checkAndUpdateBadges(userId, req.io);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    // Send response with the processed badge arrays
    res.json({
      sellerBadges: result.sellerBadges,
      userBadges: result.userBadges,
      newlyUnlocked: result.newlyUnlocked
    });
  } catch (error) {
    console.error('Error updating badges:', error);
    res.status(500).json({ error: 'Error updating badges' });
  }
};