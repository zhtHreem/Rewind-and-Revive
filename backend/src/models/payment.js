import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    cardNumber: { type: String, required: true }, 
    cvv: { type: Number, required: true }, 
    name: { type: String, required: true},
    expirationDate: { type: String, required: true},
   createdAt: { type: Date, default: Date.now }
}); 
const Payment= mongoose.model('payment', PaymentSchema);

export default Payment;