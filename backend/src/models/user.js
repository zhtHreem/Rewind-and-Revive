import mongoose from 'mongoose';
import bcrypt  from 'bcrypt';



const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { 
            return !this.googleId; 
        }},
  googleId: { type: String, unique: true ,sparse: true},
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user', // Default to 'user' for regular users
  },
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