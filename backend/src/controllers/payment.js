import Stripe from 'stripe';
import mongoose from 'mongoose';
import Payment from '../models/payment.js';
import Product from '../models/product.js';
import User from '../models/user.js';
import Notification from '../models/notifications.js';
import { checkAndUpdateBadges } from '../utils/badgeService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  const { paymentMethodId, cartItems } = req.body;
  const buyerId = req.user.id;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: 'No items in cart' });
  }

  try {
    let totalAmount = 0;
    const validProducts = [];

    for (const item of cartItems) {
      const { id, quantity } = item;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: `Invalid product ID: ${id}` });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${id}` });
      }

      if (product.isSold) {
        return res.status(400).json({ error: `Product already sold: ${product.name}` });
      }

      const itemAmount = Math.round((product.price || 10) * 100) * (quantity || 1);
      totalAmount += itemAmount;

      validProducts.push({ product, quantity: quantity || 1 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'pkr',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
       enabled: true,
       allow_redirects: 'never',  
     },
      metadata: {
        buyerId,
        cartCount: validProducts.length,
      },
    });

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment failed' });
    }

    

    
for (const { product, quantity } of validProducts) {
  const productId = product._id;
  const sellerId = product.owner;
  
  
  const paymentRecord = new Payment({
    productBuyers: buyerId,
    productOwner: sellerId,
    productId,
    amount: product.price,
    currency: 'pkr',
  });

  await paymentRecord.save();
  await Product.findByIdAndUpdate(productId, { isSold: true });

  
  await User.findByIdAndUpdate(sellerId, {
    $inc: {
      "stats.productsSold": 1,
      "stats.totalEarned": product.price,
    },
  });

  await User.findByIdAndUpdate(buyerId, {
    $inc: {
      "stats.itemsBought": 1,
      "stats.totalSpent": product.price,
    },
  });

  
  const buyer = await User.findById(buyerId, 'username');
  const seller = await User.findById(sellerId, 'username');

  if (buyer && seller) {
   
    const buyerNotification = new Notification({
      recipient: buyerId,
      sender: sellerId,
      product: productId,
      title: 'Purchase Confirmed',
      description: `You purchased ${product.name} for Rs. ${product.price}.`,
      type: 'order',
    });

    const sellerNotification = new Notification({
      recipient: sellerId,
      sender: buyerId,
      product: productId,
      title: 'Product Sold',
      description: `Your product ${product.name} was bought by ${buyer.username}.`,
      type: 'order',
    });

    await buyerNotification.save();
    await sellerNotification.save();

    
    if (req.io) {
      req.io.to(buyerId.toString()).emit('new_notification', {
        ...buyerNotification.toObject(),
        time: 'Just now',
      });

      req.io.to(sellerId.toString()).emit('new_notification', {
        ...sellerNotification.toObject(),
        time: 'Just now',
      });

      await checkAndUpdateBadges(buyerId, req.io);
      await checkAndUpdateBadges(sellerId, req.io);
    }
  }
}

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });

  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({ error: err.message });
  }
};