import express from "express";
import { createProduct,getProduct ,getProductCatalogueList,getProductRecommendations} from "../controllers/product.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { trackUserActivity } from "../middleware/recommendationMiddleware.js";
const router = express.Router();
import multer from 'multer'; // For ES Modules (if you're using them)
const upload = multer({ dest: '/tmp' });



// Create new product
router.post("/create",authMiddleware, upload.array('images', 5),createProduct)
router.get('/catalogue',getProductCatalogueList)
// Fetch product
 router.get("/:id",trackUserActivity,getProduct)


router.get('/recommendations/:productId', getProductRecommendations);



export default router;
