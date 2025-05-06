import Stripe from 'stripe';
import mongoose from 'mongoose';
import Payment from '../models/payment.js';
import Product from '../models/product.js';
import User from '../models/user.js';
import Notification from '../models/notifications.js';
import { checkAndUpdateBadges } from '../utils/badgeService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  const { paymentMethodId, productId } = req.body;
  const buyerId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'Invalid product ID format' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const amount = Math.round((product.price || 10) * 100);

    // Create the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, // Auto-confirm the payment
      metadata: {
        buyerId: buyerId,
        productId: productId,
        productOwner: product.owner.toString(),
      },
      return_url: `${process.env.FRONTEND_URL}/payment/success`, // Optional return URL
    });

    console.log("PaymentIntent created successfully");
    console.log("PaymentIntent Status:", paymentIntent.status);

    // Check if the payment was successful
    if (paymentIntent.status === 'succeeded') {
      // Save the payment in the database
      const paymentRecord = new Payment({
        productBuyers: buyerId,
        productOwner: product.owner.toString(),
        productId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      });

      try {
        await paymentRecord.save();
        console.log("Payment record saved:", paymentRecord._id);

        // Update stats for seller
        await User.findByIdAndUpdate(product.owner, {
          $inc: {
            "stats.productsSold": 1,
            "stats.totalEarned": paymentIntent.amount / 100,
          },
        });

        // Update stats for buyer
        await User.findByIdAndUpdate(buyerId, {
          $inc: {
            "stats.itemsBought": 1,
            "stats.totalSpent": paymentIntent.amount / 100,
          },
        });

        // Create notifications for both buyer and seller
        const buyer = await User.findById(buyerId, 'username');
        const seller = await User.findById(product.owner, 'username');

        if (buyer && seller) {
          const buyerNotification = new Notification({
            recipient: buyerId,
            sender: product.owner,
            product: productId,
            title: 'Purchase Confirmed',
            description: `You have successfully purchased ${product.name} for $${product.price}.`,
            type: 'order',
          });
          await buyerNotification.save();

          const sellerNotification = new Notification({
            recipient: product.owner,
            sender: buyerId,
            product: productId,
            title: 'Product Sold',
            description: `Your product ${product.name} was purchased by ${buyer.username} for $${product.price}.`,
            type: 'order',
          });
          await sellerNotification.save();

          // Optional: Send real-time notifications through Socket.io if available
          if (req.io) {
            req.io.to(buyerId.toString()).emit('new_notification', {
              ...buyerNotification.toObject(),
              time: 'Just now',
            });

            req.io.to(product.owner.toString()).emit('new_notification', {
              ...sellerNotification.toObject(),
              time: 'Just now',
            });

            // Check for badge unlocks
            await checkAndUpdateBadges(buyerId, req.io);
            await checkAndUpdateBadges(product.owner, req.io);
          }
        }

        res.status(200).json({
          clientSecret: paymentIntent.client_secret,
          status: paymentIntent.status,
        });

        console.log("Payment processed and saved successfully.");
      } catch (err) {
        console.error('Error saving payment record:', err);
        res.status(500).json({ error: 'Error saving payment record' });
      }
    } else {
      // Handle payment failure
      console.error('Payment failed:', paymentIntent.status);
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (err) {
    console.error('Error processing payment:', err.message);
    res.status(400).json({ error: err.message });
  }
};

