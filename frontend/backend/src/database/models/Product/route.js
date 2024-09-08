import express from 'express';
import multer from 'multer';
import Product from './schema.js';
import FormData from 'form-data';
import axios from 'axios';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create a new product
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const { user, name, price, description, detail, category, tags, size, material } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Prepare form data for ImgBB API
    const formData = new FormData();
    formData.append('key', 'YOUR_IMGBB_API_KEY'); // Replace with your ImgBB API key
    formData.append('image', image.buffer, {
      filename: `${Date.now()}-${image.originalname}`,
      contentType: image.mimetype
    });

    // Upload image to ImgBB
    const imgBBResponse = await axios.post('https://api.imgbb.com/1/upload', formData, {  ///CHANGE IT FOR LOCAL STORAGE
      headers: formData.getHeaders()
    });

    const imageUrl = imgBBResponse.data.data.url; // Image URL from ImgBB

    const newProduct = new Product({
      user,
      name,
      price,
      description,
      detail,
      category,
      tags,
      size,
      material,
      imageUrl
    });

    const savedProduct = await newProduct.save();
    console.log("savedProduct", savedProduct);
    res.status(201).json(savedProduct);

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: `Error creating product: ${error.message}` });
  }
});

// Read all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: `Error fetching products: ${error.message}` });
  }
});

// Search products by name
router.get('/products/search', async (req, res) => {
  console.log("searched product name:", req.query.name);
  try {
    const products = await Product.find({ name: new RegExp(req.query.name, 'i') });
    console.log("searched products list:", products);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: `Error searching products: ${error.message}` });
  }
});

// Get products by user ID
router.get('/products/user/:userId', async (req, res) => {
  try {
    console.log("userId", req.params.userId);
    const products = await Product.find({ user: req.params.userId });
    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'No products found for this user' });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: `Error fetching products: ${error.message}` });
  }
});

// Read a product by ID
router.get('/products/:id', async (req, res) => {
  console.log("productId", req.params.id);
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: `Error fetching product: ${error.message}` });
  }
});

// Update a product by ID
router.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: `Error updating product: ${error.message}` });
  }
});

// Delete a product by ID
router.delete('/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: `Error deleting product: ${error.message}` });
  }
});

export default router;
