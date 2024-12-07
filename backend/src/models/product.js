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
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Product= mongoose.model('Product', ProductSchema);

export default Product;