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
    default: () => {
      const date = new Date();
      date.setUTCHours(date.getUTCHours() + 5); 
      return date;
    }
  },
  bidEndTime: { 
    type: Date,
    default: () => {
      const date = new Date();
      date.setUTCHours(date.getUTCHours() + 5); 
      return date;
    }
  },biddingModel: { 
    type: String, 
    enum: ["Top 3 Bidders", "Highest Bidder"] // Restrict to these values
  },
  images: [{ 
    type: String 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  // Add this to your BiddingProduct schema if it doesn't exist already
   notificationsProcessed: {
  type: Boolean,
  default: false
}
});

const BiddingProduct= mongoose.model('BidProduct', BidSchema);

export default BiddingProduct;