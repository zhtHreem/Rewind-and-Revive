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
// src/controllers/payment.js
import Payment from "../models/payment.js";
import Product from '../models/product.js';
import User from '../models/user.js';
import Notification from '../models/notifications.js';
import { checkAndUpdateBadges } from '../utils/badgeService.js';
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
  
  // Get user info for notifications
  const buyer = await User.findById(buyerId, 'username');
  const seller = await User.findById(product.owner, 'username');
  // Create notification for the buyer
  const buyerNotification = new Notification({
    recipient: buyerId,
    sender: product.owner,
    product: productId,
    title: 'Purchase Confirmed',
    description: `You have successfully purchased ${product.name} for $${product.price}.`,
    type: 'order'
  });
  await buyerNotification.save();
  
  // Create notification for the seller
  const sellerNotification = new Notification({
    recipient: product.owner,
    sender: buyerId,
    product: productId,
    title: 'Product Sold',
    description: `Your product ${product.name} was purchased by ${buyer.username} for $${product.price}.`,
    type: 'order'
  });
  await sellerNotification.save();
  
  // Send targeted notifications through Socket.io
  if (req.io) {
    // Send to buyer's room
    req.io.to(buyerId.toString()).emit('new_notification', {
      ...buyerNotification.toObject(),
      time: 'Just now'
    });
    
    // Send to seller's room
    req.io.to(product.owner.toString()).emit('new_notification', {
      ...sellerNotification.toObject(),
      time: 'Just now'
    });
    
    // Check for badge unlocks immediately after purchase
    // For the buyer
    const buyerBadgeResult = await checkAndUpdateBadges(buyerId, req.io);
    
    // For the seller
    const sellerBadgeResult = await checkAndUpdateBadges(product.owner, req.io);
  }

  await User.findByIdAndUpdate(product.owner, {
    $inc: {
      "stats.productsSold": 1,
      "stats.totalEarned": product.price
    }
  });
  
  // Update buyer stats
  await User.findByIdAndUpdate(user, {
    $inc: {
      "stats.itemsBought": 1,
      "stats.totalSpent": product.price
    }
  });
  };
