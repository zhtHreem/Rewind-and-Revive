import Bid from "../models/bid.js";
import Product from "../models/biddingProduct.js";
import User from '../models/user.js';

// Add a new bid
export const addBid = async (req, res) => {
    try {
        const userId = req.user.id; // Get the user ID
        
        // Fetch the user to get their username
        const buyer = await User.findById(userId);
        if (!buyer) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const { productId, bidAmount } = req.body;
        
        if (!productId || !bidAmount) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Create new bid with the username, not the entire user object
        const newBid = new Bid({
            productId,
            bidderId: buyer,
            name: buyer.username, // Use the username property from the user document
            bidAmount,
            userId // Store userId for reference
        });
        
        await newBid.save();
        
        res.status(201).json({ message: 'Bid placed successfully', bid: newBid });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all bids for a product
export const getBidsByProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Fetch the product to check the bidding type
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        let bids;
        if (product.biddingType === "Highest Bidder") {
            bids = await Bid.find({ productId }).sort({ bidAmount: -1 }).limit(1);
        } else if (product.biddingType === "Top 3 Bidders") {
            bids = await Bid.find({ productId }).sort({ bidAmount: -1 }).limit(3);
        } else {
            bids = await Bid.find({ productId }).sort({ bidAmount: -1 }); // Default case
        }
        
        res.status(200).json(bids);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};