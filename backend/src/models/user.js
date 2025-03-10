import mongoose from 'mongoose';
import bcrypt  from 'bcrypt';


// Badge schema for both seller and user badges
const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  isAchieved: { type: Boolean, default: false }
});

const statsSchema = new mongoose.Schema({
  productsSold: { type: Number, default: 0 },
  totalListed: { type: Number, default: 0 },
  itemsBought: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  likesReceived: { type: Number, default: 0 }
});


const reviewsSchema = new mongoose.Schema({
  fiveStar: { type: Number, default: 0 },
  fourStar: { type: Number, default: 0 },
  threeStar: { type: Number, default: 0 },
  twoStar: { type: Number, default: 0 },
  oneStar: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { 
            return !this.googleId; 
        }},
  googleId: {
    type: String,  // Not required
    sparse: true,  // Ensures that null or undefined values are not indexed
  },  isEmailVerified: {type: Boolean,default: false},
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user', // Default to 'user' for regular users
  },

  stats: { type: statsSchema, default: {} },
  reviewsData: { type: reviewsSchema, default: {} },

    // Add badge arrays with their default values
  sellerBadges: {
    type: [badgeSchema],
    default: [
      { name: 'Starter Seller', description: 'Sold 1 Items', isAchieved: false },
      { name: 'Rising Star', description: 'Sold 50 Items', isAchieved: false },
      { name: 'Market Leader', description: 'Sold 100 Items', isAchieved: false },
      { name: 'Popularity Pro', description: 'Received 100 Likes', isAchieved: false },
      { name: 'Top Seller', description: 'Received 500 Likes', isAchieved: false },
      { name: 'Customer Choice', description: 'Achieved 5-Star Rating', isAchieved: false }
    ]
  },
  userBadges: {
    type: [badgeSchema],
    default: [
      { name: 'First Purchase', description: 'Bought 1 Item', isAchieved: false },
      { name: 'Frequent Buyer', description: 'Bought 10 Items', isAchieved: false },
      { name: 'Loyal Shopper', description: 'Bought 25 Items', isAchieved: false },
      { name: 'Big Spender', description: 'Bought 50 Items', isAchieved: false },
      { name: 'Ultimate Collector', description: 'Bought 100 Items', isAchieved: false },
      { name: 'Shopping Spree', description: 'Spent $500', isAchieved: false }
    ]
  },
   viewHistory: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    viewedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;