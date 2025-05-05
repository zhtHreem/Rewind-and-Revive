import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  productBuyers: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
  amount: { type: Number, required: true },
  currency: { type: String, default: 'pkr' },
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;
