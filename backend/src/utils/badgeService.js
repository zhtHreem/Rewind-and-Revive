// src/utils/badgeUtils.js
import User from '../models/user.js';
import Notification from '../models/notifications.js';
import Payment from '../models/payment.js'; // Add this import

import mongoose from 'mongoose';

/**
 * Checks and updates user badges based on their current stats
 * @param {string} userId - The user's ID
 * @param {object} io - Socket.io instance for real-time notifications
 * @param {object} stats - User statistics (optional, will be fetched if not provided)
 * @returns {object} Object containing updated badges and newly unlocked badges
 */
export const checkAndUpdateBadges = async (userId, io, userStats = null) => {
  try {
    console.log(`Checking badges for user: ${userId}`);
    
    // If stats not provided, fetch them
    if (!userStats) {
      // Get the user first to extract both stats and ratings data
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found');
        return { success: false, error: 'User not found' };
      }
      
      // Additional stats from payment data
      const paymentStats = await getPaymentStats(userId);
      
      // Combine user.stats with payment data for a complete picture
      userStats = {
        itemsSold: user.stats.productsSold || 0,
        itemsBought: paymentStats.purchasesCount || 0,
        likesReceived: user.stats.likesReceived || 0,
        totalSpent: paymentStats.totalSpent || 0,
        rating: user.averageRating || 0
      };
      
      console.log('Computed user stats:', userStats);
    }
    
    const newlyUnlockedBadges = [];
    
    // Fetch user with existing badges
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('User not found');
      return { success: false, error: 'User not found' };
    }
    
    console.log('Current user badges:', {
      sellerBadges: user.sellerBadges || [],
      userBadges: user.userBadges || []
    });
    
    // Process seller badges
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
          description: badge.description,
          isAchieved: true
        });
        
        // Create notification
        createBadgeNotification(userId, badge, io);
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
          description: badge.description,
          isAchieved: true
        });
        
        // Create notification
        createBadgeNotification(userId, badge, io);
      }
      
      return badge;
    });
    
    // Only save if badges have changed
    if (sellerBadgesChanged || customerBadgesChanged) {
      try {
        user.markModified('sellerBadges');
        user.markModified('userBadges');
        
        await user.save();
        console.log('Badges saved successfully');
      } catch (saveError) {
        console.error('Error saving user badges:', saveError);
        
        // Fallback to findByIdAndUpdate
        try {
          console.log('Attempting alternative save method...');
          await User.findByIdAndUpdate(
            userId,
            { 
              $set: { 
                sellerBadges: user.sellerBadges,
                userBadges: user.userBadges 
              } 
            },
            { new: true }
          );
        } catch (updateError) {
          console.error('Alternative update also failed:', updateError);
          return { success: false, error: 'Failed to save badges' };
        }
      }
    } else {
      console.log('No badge changes detected, skipping save.');
    }
    
    return {
      success: true,
      sellerBadges: user.sellerBadges,
      userBadges: user.userBadges,
      newlyUnlocked: newlyUnlockedBadges
    };
  } catch (error) {
    console.error('Error checking badges:', error);
    return { success: false, error: 'Error checking badges' };
  }
};

/**
 * Creates a notification for a newly unlocked badge
 * @param {string} userId - The user's ID
 * @param {object} badge - The badge object
 * @param {object} io - Socket.io instance for real-time notifications
 */
const createBadgeNotification = async (userId, badge, io) => {
  try {
    const newNotification = new Notification({
      recipient: userId,
      title: 'Badge Unlocked!',
      description: `Congratulations! You've earned the ${badge.name} badge - ${badge.description}`,
      type: 'badge',
      data: { badge: badge }
    });
    
    await newNotification.save();
    
    if (io) {
      io.to(userId.toString()).emit('new_notification', {
        ...newNotification.toObject(),
        time: 'Just now'
      });
    }
  } catch (err) {
    console.error('Failed to create badge notification:', err);
  }
};

/**
 * Gets payment-related statistics for a user
 * @param {string} userId - The user's ID
 * @returns {object} Object containing payment statistics
 */
const getPaymentStats = async (userId) => {
  try {
  
    // Count purchases
    const purchasesCount = await Payment.countDocuments({ productBuyers: userId });
    
    // Calculate total spent
    let totalSpent = 0;
    
    try {

        const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      // Try to get total spent using aggregation
      const payments = await Payment.aggregate([
        { $match: { productBuyers: mongoose.Types.ObjectId(userObjectId) } },
        { $lookup: { 
          from: 'products', 
          localField: 'productId', 
          foreignField: '_id', 
          as: 'productInfo' 
        }},
        { $unwind: '$productInfo' },
        { $group: { 
          _id: null, 
          totalSpent: { $sum: '$productInfo.price' } 
        }}
      ]);
      
      if (payments && payments.length > 0) {
        totalSpent = payments[0].totalSpent;
      }
    } catch (error) {
      console.error('Error calculating total spent:', error);
    }
    
    return {
      purchasesCount,
      totalSpent
    };
  } catch (error) {
    console.error('Error getting payment stats:', error);
    return {
      purchasesCount: 0,
      totalSpent: 0
    };
  }
};