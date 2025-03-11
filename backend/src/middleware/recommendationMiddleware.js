import Product from '../models/product.js';

// In your trackUserActivity middleware, modify the code like this:
export const trackUserActivity = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    if (!productId) {
      console.log("No product ID found in request");
      return next();
    }

    console.log("Tracking product view for product:", productId);
    
    // Ensure session and history arrays exist
    if (!req.session) {
      console.log("No session object found");
      return next();
    }
    
    // Initialize view history
    if (!req.session.viewHistory) {
      req.session.viewHistory = [];
    }
    
    // For logged-in users
    if (req.user && req.user.id) {
      if (!req.session.userViewHistory) {
        req.session.userViewHistory = [];
      }
      
      // Only add if not already first in the list
      if (req.session.userViewHistory[0] !== productId) {
        // Remove if exists elsewhere in the array
        req.session.userViewHistory = req.session.userViewHistory.filter(id => id !== productId);
        // Add to the front
        req.session.userViewHistory.unshift(productId);
        // Keep only the most recent 10
        if (req.session.userViewHistory.length > 10) {
          req.session.userViewHistory = req.session.userViewHistory.slice(0, 10);
        }
      }
      
      console.log("Updated user view history:", req.session.userViewHistory);
    } else {
      // For anonymous users - similar logic
      if (req.session.viewHistory[0] !== productId) {
        req.session.viewHistory = req.session.viewHistory.filter(id => id !== productId);
        req.session.viewHistory.unshift(productId);
        if (req.session.viewHistory.length > 10) {
          req.session.viewHistory = req.session.viewHistory.slice(0, 10);
        }
      }
      
      console.log("Updated anonymous view history:", req.session.viewHistory);
    }
    
    // Save session explicitly
    req.session.save(err => {
      if (err) {
        console.error("Error saving session:", err);
      } else {
        console.log("Session saved with ID:", req.session.id);
        console.log("Current view history:", req.user && req.user.id ? 
          req.session.userViewHistory : req.session.viewHistory);
      }
      next();
    });
  } catch (error) {
    console.error("Error tracking user activity:", error);
    next();
  }
};

// 4. Update the generateRecommendations middleware to be more robust
export const generateRecommendations = async (req, res, next) => {
  try {
    // Initialize recommendations array
    req.recommendations = [];
    
    console.log("Generating recommendations for session:", req.session.id);
    
    // Get view history based on login status
    let viewHistory = [];
    
    if (req.user && req.user.id && req.session.userViewHistory && req.session.userViewHistory.length > 0) {
      viewHistory = req.session.userViewHistory;
      console.log("Using logged-in user view history:", viewHistory);
    } else if (req.session.viewHistory && req.session.viewHistory.length > 0) {
      viewHistory = req.session.viewHistory;
      console.log("Using anonymous session view history:", viewHistory);
    } else {
      console.log("No view history found, will use trending products");
    }
    
    // Add this section to log important session data
    console.log("Session ID:", req.session.id);
    console.log("Cookie:", req.headers.cookie);
    
    if (viewHistory.length > 0) {
      try {
        // Get the most recently viewed product
        const recentProducts = await Product.find({
          _id: { $in: viewHistory.slice(0, 3) } // Get top 3 recent products
        });
        
        if (recentProducts.length > 0) {
          console.log("Found recent products:", recentProducts.map(p => p.name || p._id));
          
          // Create array of conditions to match
          const conditions = [];
          recentProducts.forEach(product => {
            if (product.category) conditions.push({ category: product.category });
            if (product.categories && product.categories.length > 0) {
              conditions.push({ categories: { $in: product.categories } });
            }
            if (product.materials && product.materials.length > 0) {
              conditions.push({ materials: { $in: product.materials } });
            }
            if (product.color) conditions.push({ color: product.color });
          });
          
          // Find similar products
          const recommendations = await Product.find({
            _id: { $nin: viewHistory }, // Exclude viewed products
            $or: conditions
          }).populate('owner', 'username').limit(6);
          
          console.log(`Found ${recommendations.length} recommendations based on product similarity`);
          req.recommendations = recommendations;
        } else {
          console.log("Recent products not found in database");
        }
      } catch (error) {
        console.error("Error finding recent products:", error);
      }
    }
    
    // If we still have no recommendations, show popular products
    if (!req.recommendations || req.recommendations.length === 0) {
      console.log("Falling back to trending products");
      req.recommendations = await Product.find()
        .sort({ createdAt: -1 })
        .populate('owner', 'username')
        .limit(6);
      console.log(`Found ${req.recommendations.length} trending products as fallback`);
    }
    
    next();
  } catch (error) {
    console.error("Error generating recommendations:", error);
    req.recommendations = [];
    next();
  }
};