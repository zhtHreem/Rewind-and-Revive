import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  name: { 
    type: String, 
    required: true 
  },
  startingPrice: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String 
  },
  bidStartTime: { 
    type: Date,
    default: () => new Date(new Date().toLocaleString("en-US", { timeZone: "Karachi" })),
  },
  bidEndTime: { 
    type: Date,
    default: () => new Date(new Date().toLocaleString("en-US", { timeZone: "Karachi" })),
  },
  images: [{ 
    type: String 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },biddingModel: {
    type: String,
    enum: ["top3", "highest"],
    default: "top3",
  },
});

const BiddingProduct= mongoose.model('BidProduct', BidSchema);

export default BiddingProduct;