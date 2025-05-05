import mongoose from 'mongoose';

const BiddingSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    name: { type: String, required: true }, 
    bidAmount: { type: Number, required: true }, 
  }, { timestamps: true }); 
const Bidding= mongoose.model('bidding', BiddingSchema);

export default Bidding;