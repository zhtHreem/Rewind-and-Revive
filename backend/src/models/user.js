import mongoose from 'mongoose';
import bcrypt  from 'bcrypt';


// Badge schema for both seller and user badges
const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  isAchieved: { type: Boolean, default: false }
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
  }
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