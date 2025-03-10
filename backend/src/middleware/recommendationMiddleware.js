import Product from '../models/product.js';

export const trackUserActivity = async (req, res, next) => {
  try {
    // Initialize session data if it doesn't exist
    if (!req.session) {
      console.error("Session not initialized");
      return next();
    }
    
    // Initialize view history arrays in session if they don't exist
    if (!req.session.viewHistory) {
      req.session.viewHistory = [];
    }
    
    if (req.user && !req.session.userViewHistory) {
      req.session.userViewHistory = [];
    }
    
    // Get the current product ID if we're viewing a product
    const productId = req.params.id;
    console.log("Tracking product view:", productId);
    
    if (productId) {
      // Choose the right history array based on login status
      const historyArray = req.user ? 'userViewHistory' : 'viewHistory';
      
      // Don't add duplicates in the recent views
      if (!req.session[historyArray].includes(productId)) {
        // Keep only the last 10 products viewed
        if (req.session[historyArray].length >= 10) {
          req.session[historyArray].pop();
        }
        req.session[historyArray].unshift(productId);
      }
      
      // Save session
      if (req.session.save) {
        req.session.save();
      }
    }
    
    next();
  } catch (error) {
    console.error("Error in tracking user activity:", error);
    next();
  }
};

// Add a recommendation generator middleware function
export const generateRecommendations = async (req, res, next) => {
  try {
    // Initialize empty recommendations array
    req.recommendations = [];
    
    // Make sure session exists
    if (!req.session) {
      console.error("Session not initialized");
      return next();
    }
    
    // Get view history based on login status
    let viewHistory = [];
    
    if (req.user && req.session.userViewHistory && req.session.userViewHistory.length > 0) {
      viewHistory = req.session.userViewHistory;
      console.log("Using logged-in user view history:", viewHistory);
    } else if (req.session.viewHistory && req.session.viewHistory.length > 0) {
      viewHistory = req.session.viewHistory;
      console.log("Using session view history:", viewHistory);
    } else {
      console.log("No view history found");
    }
    
    if (viewHistory.length > 0) {
      try {
        // Get the most recently viewed product
        const recentProduct = await Product.findById(viewHistory[0]);
        
        if (recentProduct) {
          console.log("Found recent product:", recentProduct.title || recentProduct.name);
          
          // Find products with similar categories or materials
          const recommendations = await Product.find({
            _id: { $ne: recentProduct._id }, // Exclude the current product
            $or: [
              { category: recentProduct.category },
              { categories: { $in: recentProduct.categories || [] } },
              { materials: { $in: recentProduct.materials || [] } },
              { color: recentProduct.color }
            ]
          }).limit(6);
          
          console.log("Recommendations found:", recommendations.length);
          req.recommendations = recommendations;
        } else {
          console.log("Recent product not found in database");
        }
      } catch (error) {
        console.error("Error finding recent product:", error);
      }
    }
    
    // If we still have no recommendations, show popular products
    if (req.recommendations.length === 0) {
      console.log("Falling back to popular products");
      req.recommendations = await Product.find()
        .sort({ createdAt: -1 })
        .limit(6);
    }
    
    next();
  } catch (error) {
    console.error("Error generating recommendations:", error);
    req.recommendations = [];
    next();
  }
};