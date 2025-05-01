// import Payment from "../models/payment.js";
// import Product from '../models/product.js';

// export const addPayment = async (req, res) => {
//   try {
//     const user = req.user.id;
//     const { productId, cardNumber, cvv, name, expirationDate } = req.body;

//     // Log the data for debugging
//     console.log('Received Payment Data:', {
//       productId,
//       cardNumber,
//       cvv,
//       name,
//       expirationDate,
//     });

//     // Check if all required fields are present
//     if (!cardNumber || !cvv || !name || !expirationDate) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Fetch the product to get the owner information
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

    
//     const newPayment = new Payment({
//       productBuyers: user,  
//       productOwner: product.owner,  
//       cardNumber,  
//       cvv,
//       name,
//       expirationDate,  
//     });

    
//     await newPayment.save();

    
//     res.status(201).json({
//       message: 'Payment placed successfully',
//       payment: newPayment,
//     });
//   } catch (error) {
//     console.error('Error processing payment:', error);
//     res.status(500).json({
//       message: 'Server error',
//       error: error.message,
//     });
//   }
// };
import mongoose from 'mongoose';
import Product from '../models/product.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createPaymentIntent = async (req, res) => {
  const { paymentMethodId, productId } = req.body;
  console.log("Received paymentMethodId:", paymentMethodId);
  console.log("Received productId:", productId);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    console.log("Invalid product ID format");
    return res.status(400).json({ error: 'Invalid product ID format' });
  }

  const product = await Product.findById(productId);
  console.log("Fetched product:", product);

  if (!product) {
    console.log("Product not found in DB");
    return res.status(404).json({ error: 'Product not found' });
  }

  const amount = Math.round((product.price || 10) * 100);
  console.log("Charging amount in cents:", amount);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: false,
    });

    console.log("PaymentIntent created successfully");
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

