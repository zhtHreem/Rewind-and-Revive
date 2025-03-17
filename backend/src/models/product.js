import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  color: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  category:{
    type: String,
  },
  type: { 
    type: String, 
    enum: ['top', 'bottom', 'top/bottom', 'accessories'], 
    required: true 
  },
  categories: [{ 
    type: String 
  }],
  materials: [{ 
    type: String 
  }],
  topSizes: {
    waist: Number,
    armLength: Number,
    hips: Number,
    shoulderWidth: Number,
    bustChest: Number,
    neckCircumference: Number
  },
  bottomSizes: {
    waist: Number,
    hips: Number,
    inseam: Number,
    thighLegOpening: Number,
    rise: Number
  },
  images: [{ 
    type: String 
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
    featureVector: {
    type: [Number],
    default: null,
    index: false // Don't index this large array
  }
});

const Product= mongoose.model('Product', ProductSchema);

export default Product;




