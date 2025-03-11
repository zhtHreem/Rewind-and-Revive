// src/routes/recommendationRoutes.js
import express from 'express';
import { getRecommendations, getProductRecommendations, getTrendingProducts } from '../controllers/recommendation.js';
import { trackUserActivity, generateRecommendations } from '../middleware/recommendationMiddleware.js';

const router = express.Router();

// Middleware to track user activity should be applied to product viewing routes
// This is just an example, add it to your product routes
// router.get('/products/:id', trackUserActivity, yourProductDetailController);

// Get personalized recommendations
router.get('/recommendations', generateRecommendations, getRecommendations);

// Get recommendations based on a specific product
router.get('/recommendations/product/:productId', getProductRecommendations);

// Get trending products
router.get('/trending', getTrendingProducts);

export default router;