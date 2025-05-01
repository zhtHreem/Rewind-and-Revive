import express from "express";
import { 
  createProduct,
  getProduct,
  getProductCatalogueList,
  getProductRecommendations,
  getOwnedProducts // ✅ imported here
} from "../controllers/product.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { trackUserActivity } from "../middleware/recommendationMiddleware.js";
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: '/tmp' });

// Create new product
router.post("/create", authMiddleware, upload.array('images', 5), createProduct);

// Get catalogue
router.get('/catalogue', getProductCatalogueList);

// ✅ Get products owned by logged-in user
router.get('/owned', authMiddleware, getOwnedProducts);

// Product recommendations
router.get('/recommendations/:productId', getProductRecommendations);

// Get single product
router.get("/:id", trackUserActivity, getProduct);

export default router;
