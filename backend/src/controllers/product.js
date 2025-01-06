import axios from 'axios';
import FormData from 'form-data'; // Ensure this is imported
import fs from 'fs'; // Import fs for file reading
import Product from '../models/Product.js';

export const createProduct = async (req, res) => {
  try {
    const user=req.user.id
    const price = parseFloat(req.body.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        message: 'Invalid price. Must be a positive number.'
      });
    }
    
    const categories = req.body.categories  ? JSON.parse(req.body.categories) : [];
    const materials = req.body.materials  ? JSON.parse(req.body.materials) : [];

    let topSizes = {};
    let bottomSizes = {};

    if (req.body.topSizes) {
      topSizes = JSON.parse(req.body.topSizes);
    }

    if (req.body.bottomSizes) {
      bottomSizes = JSON.parse(req.body.bottomSizes);
    }

    const images = req.files; // Multiple files uploaded here
    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Limit the number of images to 5
    if (images.length > 5) {
      return res.status(400).json({ error: 'You can only upload up to 5 images' });
    }

    // Array to store image URLs
    const imageUrls = [];

    // Loop through each file, upload it to ImgBB, and collect the URLs
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filePath = image.path; // Get the path to the file

      // Prepare form data for ImgBB API
      const formData = new FormData();
      formData.append('key', process.env.IMGBB_API_KEY);
      formData.append('image', fs.createReadStream(filePath), {
        filename: `${Date.now()}-${image.originalname}`,
        contentType: image.mimetype
      });

      // Upload image to ImgBB
      try {
        const imgBBResponse = await axios.post('https://api.imgbb.com/1/upload', formData, {
          headers: formData.getHeaders()
        });
        const imageUrl = imgBBResponse.data.data.url;
        imageUrls.push(imageUrl); // Add the URL to the imageUrls array
        console.log('Image uploaded to ImgBB:', imageUrl);
      } catch (error) {
        return res.status(500).json({
          message: 'Error uploading image to ImgBB',
          error: error.message
        });
      }
    }

    // Create new product with image URLs
    const newProduct = new Product({
      owner:user,
      name: req.body.name,
      price: parseFloat(req.body.price),
      color: req.body.color,
      category:req.body.category,
      description: req.body.description || '',
      type: req.body.type,
      categories,
      materials,
      topSizes, bottomSizes,  images: imageUrls 
    });

    // Save product to database
    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      message: 'Error creating product',
      error: error.message
    });
  }
};





// Endpoint to fetch products
export const getProductCatalogueList = async (req, res) => {
  try {
    const products = await Product.find(); // You can add filters based on query params
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};




// Get a single product by ID
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('owner', 'username') // Populate only the username field
      .exec();
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};