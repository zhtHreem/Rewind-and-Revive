import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    productBuyers: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 

    cardNumber: { type: String, required: true }, 
    cvv: { type: Number, required: true }, 
    name: { type: String, required: true},
    expirationDate: { type: String, required: true},
   createdAt: { type: Date, default: Date.now }
}); 
const Payment= mongoose.model('payment', PaymentSchema);

export default Payment;