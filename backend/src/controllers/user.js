import User from "../models/user.js";
import mongoose from "mongoose";
//import { generateToken } from "../utils/jwtUtils.js";
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
    const rating =  0;

    return {
      itemsSold,
      itemsBought ,
      likesReceived,
      rating
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};

// Route to get badges for both Seller and Customer
export const Userbadges = async (req, res) => {
  const userId = req.user.id; // Assuming user info is in req.user
  const userStats =await getUserStats(userId);
  const newlyUnlockedBadges = [];
  // Modify the seller badges based on stats
  const sellerUpdatedBadges = sellerBadges.map((badge) => {
     const wasAchieved = badge.isAchieved;
    if (badge.name === 'Starter Seller' && userStats.itemsSold >= 1) badge.isAchieved = true;
    if (badge.name === 'Rising Star' && userStats.itemsSold >= 50) badge.isAchieved = true;
    if (badge.name === 'Market Leader' && userStats.itemsSold >= 100) badge.isAchieved = true;
    if (badge.name === 'Popularity Pro' && userStats.likesReceived >= 100) badge.isAchieved = true;
    if (badge.name === 'Top Seller' && userStats.likesReceived >= 500) badge.isAchieved = true;
    if (badge.name === 'Customer Choice' && userStats.rating === 5.0) badge.isAchieved = true;
    //return badge;
 

   // If badge wasn't achieved before but is now, emit socket event
    if (!wasAchieved && badge.isAchieved) {
      newlyUnlockedBadges.push(badge);
      // Emit socket event for each newly unlocked badge
       const notification = {
        id: Date.now(),
        title: 'Badge Unlocked!',
        description: `Congratulations! You've earned the ${badge.name} badge - ${badge.Description}`,
        time: 'just now',
        isRead: false,
        badgeData: badge // Include badge data
      };
            // Use req.io directly (it's already set up in your middleware)
      req.io.emit('new_notification', notification);
    }
    return badge;
  });

  // Modify the customer badges based on stats
  const customerUpdatedBadges = userBadges.map((badge) => {
     const wasAchieved = badge.isAchieved;
    if (badge.name === 'First Purchase' && userStats.itemsBought >= 1) badge.isAchieved = true;
    if (badge.name === 'Frequent Buyer' && userStats.itemsBought >= 10) badge.isAchieved = true;
    if (badge.name === 'Loyal Shopper' && userStats.itemsBought >= 25) badge.isAchieved = true;
    if (badge.name === 'Big Spender' && userStats.itemsBought >= 50) badge.isAchieved = true;
    if (badge.name === 'Ultimate Collector' && userStats.itemsBought >= 100) badge.isAchieved = true;
    if (badge.name === 'Shopping Spree' && userStats.totalSpent >= 500) badge.isAchieved = true;

    if (!wasAchieved && badge.isAchieved) {
      newlyUnlockedBadges.push(badge);
      
      const testNotification = {
        id: Date.now(),
        title: 'Badge Unlocked!',
        description: `Congratulations! You've earned the ${badge.name} badge - ${badge.Description}`,
        time: 'just now',
        isRead: false,
      }     
   

    // Broadcast the notification to all connected clients
            req.io.emit('new_notification', testNotification);
     //   badgeData: badge
     
    }
    return badge;
  });

   

  console.log('Seller Badges:', sellerUpdatedBadges);
    console.log('user Badges:', customerUpdatedBadges );
  // Respond with both badge types
  res.json({
    sellerBadges: sellerUpdatedBadges,
    userBadges: customerUpdatedBadges,
    newlyUnlocked: newlyUnlockedBadges
  });
};