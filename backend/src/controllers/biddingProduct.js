import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import Product from "../models/biddingProduct.js";
import FormData from "form-data";

// Configure Multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}${path.extname(file.originalname)}`);
//   },
// });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp"); // Use writable /tmp directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});


const upload = multer({ storage }).array("image", 5); // Allow multiple file uploads

export const createProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: "Image upload failed." });
    }
  
    console.log("Uploaded files:", req.files);
  
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one image must be uploaded." });
    }
  
    const imageUrls = [];
    for (const file of req.files) {
      const filePath = file.path;
      const formData = new FormData();
      formData.append("key", process.env.IMGBB_API_KEY);
      formData.append("image", fs.readFileSync(filePath).toString("base64"));
  
      try {
        const imgBBResponse = await axios.post("https://api.imgbb.com/1/upload", formData, {
          headers: formData.getHeaders(),
        });
        console.log("ImgBB Response:", imgBBResponse.data); // Log the ImgBB response
        imageUrls.push(imgBBResponse.data.data.url);
      } catch (error) {
        console.error("ImgBB upload failed:", error.message);
        return res.status(500).json({ error: "Failed to upload image to ImgBB." });
      }
    }
  
    console.log("Image URLs to save:", imageUrls);
  
    try {
      const product = new Product({
        name: req.body.name,
        startingPrice: req.body.startingPrice,
        description: req.body.description,
        bidStartTime: req.body.bidStartTime,
        bidEndTime: req.body.bidEndTime,
        images: imageUrls,
        biddingModel: req.body.biddingModel,
      });
  
      const savedProduct = await product.save();
      console.log("Saved Product:", savedProduct);
      res.status(201).json({ message: "Product created successfully", product: savedProduct });
    } catch (error) {
      console.error("Error saving product:", error.message);
      res.status(500).json({ error: "Failed to save product." });
    }
  });
}  
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