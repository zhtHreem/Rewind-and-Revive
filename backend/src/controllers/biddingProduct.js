import multer from "multer";
import path from "path";
import Product from "../models/biddingProduct.js";

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure the 'uploads/' directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Generate a unique file name
  },
});

const upload = multer({ storage }).single("image");

// Create a new product
export const createProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: "Image upload failed." });
    }

    const {
      name,
      startingPrice,
      description,
      bidStartTime,
      bidEndTime,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !startingPrice ||
      !description ||
      !bidStartTime ||
      !bidEndTime ||
      !req.file
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    try {
      const product = new Product({
        name,
        startingPrice,
        description,
        bidStartTime,
        bidEndTime,
        imageUrl: `/uploads/${req.file.filename}`, // Store file path
      });

      await product.save();
      res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product." });
    }
  });
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products." });
  }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product." });
  }
};