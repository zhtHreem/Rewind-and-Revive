import io from '../../server.js';
import Bid from "../models/bid.js";

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
      const productId  = req.params.id;
      const bids = await Bid.find({ productId }).sort({ bidAmount: -1 }); // Sort by bidAmount descending
      res.status(200).json(bids);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
};
