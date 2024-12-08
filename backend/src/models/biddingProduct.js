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
    type: Date 
  },
  bidEndTime: { 
    type: Date 
  },
  images: [{ 
    type: String 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const BiddingProduct= mongoose.model('BidProduct', BidSchema);

export default BiddingProduct;