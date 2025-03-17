import Product from '../models/product.js';

// Get personalized recommendations based on user's history
export const getRecommendations = async (req, res) => {
  try {
    // Log session info for debugging
    // console.log("Session ID:", req.session.id);
    // console.log("User logged in:", !!req.user);
    // console.log("View history:", req.session.viewHistory || []);
    // console.log("User view history:", req.session.userViewHistory || []);
    // console.log("Generated recommendations:", req.recommendations || []);
    
    return res.status(200).json({
      success: true,
      recommendations: req.recommendations || []
    });
  } catch (error) {
    console.error("Error in recommendation controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
      error: error.message
    });
  }
};
// Get product recommendations for a specific product
export const getProductRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("productId",productId);
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    // Find similar products based on category, type, or materials
    const recommendations = await Product.find({
      _id: { $ne: productId }, // Exclude current product
      $or: [
        { category: product.category },
        { type: product.type },
        { materials: { $in: product.materials } },
        { color: product.color }
      ]
    }).limit(6);
    
    return res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error("Error in product recommendation controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get product recommendations",
      error: error.message
    });
  }
};

// Get trending or popular products
export const getTrendingProducts = async (req, res) => {
  try {
    // This is a placeholder - in a real app, you'd have logic to determine trending products
    // For now, we're just getting the most recent products
    const trendingProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(6);
    
    return res.status(200).json({
      success: true,
      trendingProducts
    });
  } catch (error) {
    console.error("Error in trending products controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get trending products",
      error: error.message
    });
  }
};