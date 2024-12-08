import express from "express";
const router = express.Router();
import { createProduct, getProducts, getProductById } from "../controllers/biddingProduct.js";

// Route to create a new product
router.post("/create", createProduct);

// Route to fetch all products
router.get("/get", getProducts);

// Route to fetch a single product by ID
router.get("/:id", getProductById);

export default router;
