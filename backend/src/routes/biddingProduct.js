import express from "express";
const router = express.Router();
import { createProduct, getProducts, getProductById } from "../controllers/biddingProduct.js";


router.post("/create", createProduct);

router.get("/get", getProducts);

router.get("/:id", getProductById);

export default router;
