import axios from 'axios';
import FormData from 'form-data'; // Ensure this is imported
import fs from 'fs'; // Import fs for file reading
import Product from '../models/product.js';
import User from "../models/user.js";
import ProductMatcher from '../utils/productMatcher.js';



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


  // AFTER sending response, try to queue the feature extraction job
  //  global.console.log('Queuing feature extraction job for product:', savedProduct._id);
     if (savedProduct.images && savedProduct.images.length > 0) {
      // global.console.log("entered")
      // This runs asynchronously without blocking
      (async () => {
        try {
          // global.console.log("entered1 ")
          const matcher = new ProductMatcher();
          await matcher.loadFeatureExtractor();
          const features = await matcher.extractFeatures(savedProduct.images[0]);
          //  global.console.log("entered2")
          // Update the product with the feature vector
          await Product.findByIdAndUpdate(savedProduct._id, {
            featureVector: Array.from(features)
          });
          
          //  global.console.log(`Features extracted for product ${savedProduct._id}`);
        } catch (extractionError) {
          //  global.console.error('Feature extraction error (non-critical):', extractionError);
        }
      })();
    }
     


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
    console.log('hi')
    const products = await Product.find(); // You can add filters based on query params
    console.log("s",products)
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
        // Add this section at the end before sending the response
    console.log("Serving product:", req.params.id);
    console.log("Current session viewHistory:", req.session.viewHistory || []);
    
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

















export const getProductRecommendations = async (req, res) => {
    try {
        const { productId } = req.params;
        const { 
            topK = 5, 
            matchType = 'false', 
            matchMaterials = 'false',
            matchCategories = 'false'
        } = req.query;
        
       // console.log('Starting recommendation request:', { matchType, matchMaterials, matchCategories });

        // 1. Initialize ProductMatcher
        const matcher = new ProductMatcher();
       // console.log('🧪 Starting ProductMatcher...\n');

        // 2. Check database connection and count products
        const totalCount = await Product.countDocuments();
       // console.log(`Total products in database: ${totalCount}`);

        // 3. Get the source product with owner details
        const testProduct = await Product.findById(productId).populate('owner', 'username');

        if (!testProduct) {
            throw new Error('Product not found');
        }

      //  console.log('\nTest product details:', {
      //       id: testProduct._id,
      //       name: testProduct.name,
      //       owner: testProduct.owner?.username,  // Owner's name
      //       type: testProduct.type,
      //       hasImages: testProduct.images?.length > 0,
      //       imageUrls: testProduct.images,
      //       materials: testProduct.materials,
      //       categories: testProduct.categories,
      //       category: testProduct.category
      //   });

        // 4. Find potential matches and populate owner details
        const potentialMatches = await Product.find({
            _id: { $ne: testProduct._id },
            images: { $exists: true, $ne: [] }
        }).populate('owner', 'username averageRating');  // Populate owner details

        // console.log(`\nFound ${potentialMatches.length} other products with images`);
        // console.log('Sample of potential matches:', 
        //     potentialMatches.slice(0, 3).map(p => ({
        //         id: p._id,
        //         name: p.name,
        //         owner: p.owner?.username,  // Owner's name
        //         type: p.type,
        //         hasImages: p.images?.length > 0
        //     }))
        // );

     
      //  // 5. Get Product Recommendations with specified criteria
      // console.log('\nTesting Product Recommendations...');
      let recommendations = await matcher.recommendProducts(testProduct._id, {
    topK: Number(topK),
    matchType: matchType === 'true',
    matchMaterials: matchMaterials === 'true',
    matchCategories: matchCategories === 'true',
    category: testProduct.category
   });

// Fix: Populate owner for each recommended product
recommendations = await Promise.all(recommendations.map(async (rec) => {
    const populatedProduct = await Product.findById(rec.product._id).populate('owner', 'username averageRating');
    // console.log("Owner Data:", JSON.stringify(populatedProduct.owner, null, 2));
    return {
        product: {
            ...populatedProduct.toObject(),
            owner: populatedProduct.owner || { username: "Unknown", averageRating: 0 } // Default if owner is missing
        },
        similarity: rec.similarity,
        matchScore: rec.matchScore
    };
}));
       console.log('\n🎉 Recommendations generated successfully!');


        if (!Array.isArray(recommendations)) {
        //    console.error('Recommendations is not an array:', recommendations);
            throw new Error('Invalid recommendations format returned');
        }

        // 6. Print recommendations for debugging
      //  console.log('\nRecommendations found:', recommendations.length);
        recommendations.forEach((rec, index) => {
            // console.log(`\n${index + 1}. ${rec.product.name}`);
            // console.log(`   ID: ${rec.product._id}`);
            // console.log(`   Owner: ${rec.product.owner?.username}`);  // Owner's name
            //  console.log(`   Owner: ${rec.product.owner}`);  // Owner's name
            // console.log(`   Type: ${rec.product.type}`);
            // console.log(`   Has Images: ${rec.product.images?.length > 0}`);
            // console.log(`   Image URL: ${rec.product.images?.[0]}`);
            // console.log(`   Similarity Score: ${(rec.similarity * 100).toFixed(2)}%`);
            // console.log(`   Match Score: ${rec.matchScore}`);
        });

       // console.log('\n🎉 Recommendations generated successfully!');

        // 7. Send response with owner details
        res.json({
            success: true,
            recommendations: recommendations.slice(0, 6).map(match => ({
                product: {
                    _id: match.product._id,
                    name: match.product.name,
                    owner: {
                      username: match.product.owner.username,
                      averageRating: match.product.owner.averageRating || 0 // Ensure it has a default value
                  },  // Include owner name and average rating
                    price: match.product.price,
                    color: match.product.color,
                    description: match.product.description,
                    category: match.product.category,
                    type: match.product.type,
                    images: match.product.images
                },
                similarity: match.similarity,
                matchScore: match.matchScore
            }))
        });

    } catch (error) {
        // console.error('❌ Recommendation error:', error);
        // console.error('Error details:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};


