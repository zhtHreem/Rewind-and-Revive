// models/Product.js
import mongoose from 'mongoose';


const ProductSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['top', 'bottom', 'accessories'],
    required: true
  },
  categories: [String],
  materials: [String],
  size: {
    type: Map,
    of: Number // Example: { waist: 30, armLength: 25 }
  },
  image: {
    type: String, // URL to the image
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

export default Product;