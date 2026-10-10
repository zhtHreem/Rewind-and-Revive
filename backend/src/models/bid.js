import mongoose from 'mongoose';

const BiddingSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    name: { type: String, required: true }, 
    bidAmount: { type: Number, required: true },
    isSample: { type: Boolean, default: false }, // demo bids written by scripts/seed-sample-lots.js 
  }, { timestamps: true }); 
const Bidding= mongoose.model('bidding', BiddingSchema);

export default Bidding;