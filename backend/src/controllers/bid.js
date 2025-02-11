import Bid from "../models/bid.js";
import Product from "../models/biddingProduct.js";

// Add a new bid
export const addBid = async (req, res) => {
    try {
        const { productId, name, bidAmount } = req.body;
        if (!productId || !name || !bidAmount) {
          return res.status(400).json({ message: 'All fields are required' });
        }
    
        const newBid = new Bid({ productId, name, bidAmount });
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
      if (product.biddingType === "Top 3 Bidders") {
          bids = await Bid.find({ productId }).sort({ bidAmount: -1 }).limit(3);
      } else if (product.biddingType === "Highest Bidder") {
          bids = await Bid.find({ productId }).sort({ bidAmount: -1 }).limit(1);
      } else {
          bids = await Bid.find({ productId }).sort({ bidAmount: -1 }); // Default case
      }

      res.status(200).json(bids);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }
};
