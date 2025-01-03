import express from "express";
import { createProduct,getProduct ,getProductCatalogueList} from "../controllers/product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
import multer from 'multer'; // For ES Modules (if you're using them)
const upload = multer({ dest: 'uploads/' });

// Create new product
router.post("/create",authMiddleware, upload.array('images', 5),createProduct)
router.get('/catalogue',getProductCatalogueList)
// Fetch product
router.get("/:id",getProduct)



export default router;
