import User from "../models/user.js";
import mongoose from "mongoose";
//import { generateToken } from "../utils/jwtUtils.js";
import Notification from '../models/notifications.js';
import Payment from "../models/payment.js";
import { generateToken } from "../utils/jwtUtils.js";
import { OAuth2Client } from 'google-auth-library';
import { sendVerificationEmail } from "../utils/emailVerificationUtils.js";
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
      console.log("Fetching user profile for ID:", id);

      const user = await User.findById(id).select('-password');
      
      if (!user) {
          console.error("User not found!");
          return res.status(404).json({ message: "User not found" });
      }

      console.log("User found and sending data:", user);
      res.status(200).json(user);
  } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Mock seller and customer badges
const sellerBadges = [
  { name: 'Starter Seller', Description: 'Sold 10 Items', image: './badges/startseller.png', isAchieved: false },
  { name: 'Rising Star', Description: 'Sold 50 Items', image: './badges/star.png', isAchieved: false },
  { name: 'Market Leader', Description: 'Sold 100 Items', image: './badges/marketleader.png', isAchieved: false },
  { name: 'Popularity Pro', Description: 'Received 100 Likes', image: './badges/popularitypro.png', isAchieved: false },
  { name: 'Top Seller', Description: 'Received 500 Likes', image: './badges/sell.png', isAchieved: false },
  { name: 'Customer Choice', Description: 'Achieved 5-Star Rating', image: './badges/bestseller.png', isAchieved: false },
];

const userBadges = [
  { name: 'First Purchase', Description: 'Bought 1 Item', image: './badges/firstpurchase.png', isAchieved: false },
  { name: 'Frequent Buyer', Description: 'Bought 10 Items', image: './badges/frequentpurchase.png', isAchieved: false },
  { name: 'Loyal Shopper', Description: 'Bought 25 Items', image: './badges/loyalshopper.png', isAchieved: false },
  { name: 'Big Spender', Description: 'Bought 50 Items', image: './badges/bigspender.png', isAchieved: false },
  { name: 'Ultimate Collector', Description: 'Bought 100 Items', image: './badges/ultimatecollector.png', isAchieved: false },
  { name: 'Shopping Spree', Description: 'Spent $500', image: './badges/shoppingspree.png', isAchieved: false },
];


// // Mock user stats
// const getUserStats = (userId) => ({
//   itemsSold: 102,
//   itemsBought: 15,
//   likesReceived: 110,
//   rating: 5.0,
//   totalSpent: 600,
// });

// Get user stats including payment data
const getUserStats = async (userId) => {
  try {
  

    // Fetch purchases and sales directly
    const purchasesCount = await Payment.countDocuments({ productBuyers: userId });
  //  console.log("purchaseCount",purchasesCount)
    const salesCount = await Payment.countDocuments({ productOwner: userId });

    // Extract values from aggregation results
    const itemsBought =purchasesCount || 0;
    const itemsSold = salesCount || 0;
    const likesReceived = 0;
    //const rating =  0;

    return {
      itemsSold,
      itemsBought ,
      likesReceived,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
  
};

// Update average rating
export const updateAverageRating = async (req, res) => {
  try {
    // console.log("Request Params:", req.params); // Debugging
    // console.log("Request Body:", req.body);     // Debugging

    // const { userId } = req.params;
    let { averageRating } = req.body;
    averageRating = parseFloat(averageRating);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (isNaN(averageRating)) {
      return res.status(400).json({ message: "Average rating must be a valid number" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { averageRating } }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Average rating updated", user });
  } catch (error) {
    console.error("Error updating average rating:", error);
    res.status(500).json({ message: "Internal server error" });
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
    console.log(`Updating badges for user: ${userId}`);
    
    const userStats = await getUserStats(userId);
    
    if (!userStats) {
      return res.status(500).json({ error: 'Failed to retrieve user statistics' });
    }
    
    const newlyUnlockedBadges = [];
    
    // Fetch user with existing badges
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Current user badges:', {
      sellerBadges: user.sellerBadges || [],
      userBadges: user.userBadges || []
    });
    
    // Process seller badges - note we're using 'description' (lowercase) to match your model
    let sellerBadgesChanged = false;
    user.sellerBadges = user.sellerBadges.map(badge => {
      const wasAchieved = badge.isAchieved;
      
      if (badge.name === 'Starter Seller' && userStats.itemsSold >= 1) badge.isAchieved = true;
      if (badge.name === 'Rising Star' && userStats.itemsSold >= 50) badge.isAchieved = true;
      if (badge.name === 'Market Leader' && userStats.itemsSold >= 100) badge.isAchieved = true;
      if (badge.name === 'Popularity Pro' && userStats.likesReceived >= 100) badge.isAchieved = true;
      if (badge.name === 'Top Seller' && userStats.likesReceived >= 500) badge.isAchieved = true;
      if (badge.name === 'Customer Choice' && userStats.rating === 5.0) badge.isAchieved = true;
      
      if (!wasAchieved && badge.isAchieved) {
        sellerBadgesChanged = true;
        newlyUnlockedBadges.push({
          name: badge.name,
          description: badge.description, // Using lowercase to match your model
          isAchieved: true
        });
        
        // Create notification
        (async () => {
          try {
            const newNotification = new Notification({
              recipient: userId,
              title: 'Badge Unlocked!',
              description: `Congratulations! You've earned the ${badge.name} badge - ${badge.description}`,
              type: 'badge',
              data: { badge: badge }
            });
            
            await newNotification.save();
            
            if (req.io) {
              req.io.to(userId.toString()).emit('new_notification', {
                ...newNotification.toObject(),
                time: 'Just now'
              });
            }
          } catch (err) {
            console.error('Failed to create notification:', err);
          }
        })();
      }
      
      return badge;
    });
    
    // Process customer badges
    let customerBadgesChanged = false;
    user.userBadges = user.userBadges.map(badge => {
      const wasAchieved = badge.isAchieved;
      
      if (badge.name === 'First Purchase' && userStats.itemsBought >= 1) badge.isAchieved = true;
      if (badge.name === 'Frequent Buyer' && userStats.itemsBought >= 10) badge.isAchieved = true;
      if (badge.name === 'Loyal Shopper' && userStats.itemsBought >= 25) badge.isAchieved = true;
      if (badge.name === 'Big Spender' && userStats.itemsBought >= 50) badge.isAchieved = true;
      if (badge.name === 'Ultimate Collector' && userStats.itemsBought >= 100) badge.isAchieved = true;
      if (badge.name === 'Shopping Spree' && userStats.totalSpent >= 500) badge.isAchieved = true;
      
      if (!wasAchieved && badge.isAchieved) {
        customerBadgesChanged = true;
        newlyUnlockedBadges.push({
          name: badge.name,
          description: badge.description, // Using lowercase to match your model
          isAchieved: true
        });
        
        // Create notification
        (async () => {
          try {
            const newNotification = new Notification({
              recipient: userId,
              title: 'Badge Unlocked!',
              description: `Congratulations! You've earned the ${badge.name} badge - ${badge.description}`,
              type: 'badge',
              data: { badge: badge }
            });
            
            await newNotification.save();
            
            if (req.io) {
              req.io.to(userId.toString()).emit('new_notification', {
                ...newNotification.toObject(),
                time: 'Just now'
              });
            }
          } catch (err) {
            console.error('Failed to create notification:', err);
          }
        })();
      }
      
      return badge;
    });
    
    console.log('Updated badges:', {
      sellerBadges: user.sellerBadges,
      userBadges: user.userBadges,
      newlyUnlocked: newlyUnlockedBadges
    });
    
    // Only save if badges have changed
    if (sellerBadgesChanged || customerBadgesChanged) {
      try {
        // Use markModified to tell Mongoose we've modified the badge arrays
        user.markModified('sellerBadges');
        user.markModified('userBadges');
        
        const savedUser = await user.save();
        console.log('Badges saved successfully:', {
          sellerBadges: savedUser.sellerBadges,
          userBadges: savedUser.userBadges
        });
      } catch (saveError) {
        console.error('Error saving user badges:', saveError);
        
        // Try alternative approach with findByIdAndUpdate
        try {
          console.log('Attempting alternative save method...');
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
              $set: { 
                sellerBadges: user.sellerBadges,
                userBadges: user.userBadges 
              } 
            },
            { new: true }
          );
          
          console.log('Alternative save successful:', {
            sellerBadges: updatedUser.sellerBadges,
            userBadges: updatedUser.userBadges
          });
        } catch (updateError) {
          console.error('Alternative update also failed:', updateError);
        }
      }
    } else {
      console.log('No badge changes detected, skipping save.');
    }
    
    // Send response with the processed badge arrays
    res.json({
      sellerBadges: user.sellerBadges,
      userBadges: user.userBadges,
      newlyUnlocked: newlyUnlockedBadges
    });
  } catch (error) {
    console.error('Error updating badges:', error);
    res.status(500).json({ error: 'Error updating badges' });
  }
};