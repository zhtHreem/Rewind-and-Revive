import express from "express";
const router = express.Router();
import { createProduct, getProducts, getProductById } from "../controllers/biddingProduct.js";
import authMiddleware from "../middleware/authMiddleware.js";


router.post("/create", authMiddleware, createProduct);

router.get("/get", getProducts);

router.get("/:id", getProductById);

export default router;
