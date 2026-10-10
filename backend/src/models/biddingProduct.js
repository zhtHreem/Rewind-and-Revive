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
  // Auction-house style details (all optional, so existing lots keep working).
  lotCollection: { type: String },    // e.g. "Red carpet", "Timepieces"
  provenance: { type: String },        // where the piece came from
  authenticity: { type: String },      // certificate / documentation note
  condition: { type: String },         // short condition report
  estimateLow: { type: Number },
  estimateHigh: { type: Number },
  soldFor: { type: Number },           // final price once a lot has closed
  cycleDays: { type: Number },         // sample lots reopen every N days (see utils/rollingSchedule.js)
  isSample: { type: Boolean, default: false }, // demo lots, see scripts/seed-sample-lots.js
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

BidSchema.index({ createdAt: -1 });
BidSchema.index({ bidEndTime: 1, notificationsProcessed: 1 }); // ended-auction checks

const BiddingProduct= mongoose.model('BidProduct', BidSchema);

export default BiddingProduct;