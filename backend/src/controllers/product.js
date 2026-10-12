import axios from 'axios';
import FormData from 'form-data'; // Ensure this is imported
import fs from 'fs'; // Import fs for file reading
import Product from '../models/product.js';
import User from "../models/user.js";
import ProductMatcher from '../utils/productMatcher.js';



export const createProduct = async (req, res) => {
  try {
    const user = req.user.id;
    const price = parseFloat(req.body.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        message: 'Invalid price. Must be a positive number.'
      });
    }

    const categories = req.body.categories ? JSON.parse(req.body.categories) : [];
    const materials = req.body.materials ? JSON.parse(req.body.materials) : [];

    let topSizes = {};
    let bottomSizes = {};

    if (req.body.topSizes) {
      topSizes = JSON.parse(req.body.topSizes);
    }

    if (req.body.bottomSizes) {
      bottomSizes = JSON.parse(req.body.bottomSizes);
    }

    const images = req.files;
    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (images.length > 5) {
      return res.status(400).json({ error: 'You can only upload up to 5 images' });
    }

    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filePath = image.path;

      const formData = new FormData();
      formData.append('key', process.env.IMGBB_API_KEY);
      formData.append('image', fs.createReadStream(filePath), {
        filename: `${Date.now()}-${image.originalname}`,
        contentType: image.mimetype
      });

      try {
        const imgBBResponse = await axios.post('https://api.imgbb.com/1/upload', formData, {
          headers: formData.getHeaders()
        });
        const imageUrl = imgBBResponse.data.data.url;
        imageUrls.push(imageUrl);
        console.log('Image uploaded to ImgBB:', imageUrl);

      } catch (error) {
        return res.status(500).json({
          message: 'Error uploading image to ImgBB',
          error: error.message
        });
      }
    }

    const newProduct = new Product({
      owner: user,
      name: req.body.name,
      price: parseFloat(req.body.price),
      color: req.body.color,
      category: req.body.category,
      description: req.body.description || '',
      type: req.body.type,
      categories,
      materials,
      topSizes,
      bottomSizes,
      images: imageUrls
    });

    const savedProduct = await newProduct.save();

    // ✅ Increment totalListed for the user
    await User.findByIdAndUpdate(user, {
      $inc: { 'stats.totalListed': 1 }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct
    });

    if (savedProduct.images && savedProduct.images.length > 0) {
      (async () => {
        try {
          const matcher = new ProductMatcher();
          await matcher.loadFeatureExtractor();
          const features = await matcher.extractFeatures(savedProduct.images[0]);
          await Product.findByIdAndUpdate(savedProduct._id, {
            featureVector: Array.from(features)
          });
        } catch (extractionError) {
          console.error('Feature extraction error (non-critical):', extractionError);
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


export const getOwnedProducts = async (req, res) => {
  try {
    const userId = req.user.id; // comes from authMiddleware
    const products = await Product.find({ owner: userId }).select('-featureVector').lean();
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching owned products:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Public: the products listed by one seller (only fields that are safe to show).
export const getProductsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(ownerId)) return res.status(400).json({ error: 'Invalid seller id' });
    const products = await Product.find({ owner: ownerId })
      .select('name price images type category isSold createdAt')
      .sort({ isSold: 1, createdAt: -1 })
      .lean();
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching seller products:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProductCatalogueList = async (req, res) => {
  try {
    // Pagination is OPT-IN. Only kicks in when the client passes ?page or ?limit.
    // Without query params, behavior is identical to before (returns all products).
    const paginated = req.query.page !== undefined || req.query.limit !== undefined;

    const baseQuery = Product.find()
      .sort({ isSold: 1, createdAt: -1 })
      // Only the fields the catalogue card actually uses — smaller payload, faster JSON.
      .select({ name: 1, price: 1, type: 1, category: 1, isSold: 1, owner: 1, createdAt: 1, images: { $slice: 2 } })
      .populate('owner', 'username')
      .lean(); // Skip Mongoose doc hydration — faster serialization.

    if (!paginated) {
      const products = await baseQuery;
      res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.json(products);
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(60, Math.max(1, parseInt(req.query.limit) || 24));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      baseQuery.skip(skip).limit(limit),
      Product.estimatedDocumentCount(),
    ]);

    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json({
      products,
      total,
      page,
      limit,
      hasMore: skip + products.length < total,
    });
  } catch (error) {
    console.error("Error fetching product catalogue:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};





// Get a single product by ID
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-featureVector') // large numeric array the UI never uses
      .populate('owner', 'username') // Populate only the username field
      .lean();
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
        // Add this section at the end before sending the response
    // (session history is kept by trackUserActivity)
    
    
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

        // 4. Ask the matcher for the best matches
      let recommendations = await matcher.recommendProducts(testProduct._id, {
    topK: Number(topK),
    matchType: matchType === 'true',
    matchMaterials: matchMaterials === 'true',
    matchCategories: matchCategories === 'true',
    category: testProduct.category
   });

// Fix: Populate owner for each recommended product
const owned = await Product.find({ _id: { $in: recommendations.map((r) => r.product._id) } })
    .select('-featureVector')
    .populate('owner', 'username averageRating')
    .lean();
const byId = new Map(owned.map((p) => [String(p._id), p]));
recommendations = recommendations
    .filter((rec) => byId.has(String(rec.product._id)))
    .map((rec) => {
        const p = byId.get(String(rec.product._id));
        return {
            product: { ...p, owner: p.owner || { username: 'Unknown', averageRating: 0 } },
            similarity: rec.similarity,
            matchScore: rec.matchScore
        };
    });
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


