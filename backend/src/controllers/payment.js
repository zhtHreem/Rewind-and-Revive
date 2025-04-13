import Payment from "../models/payment.js";
import Product from '../models/product.js';
import User from '../models/user.js';
import Notification from '../models/notifications.js';

export const addPayment = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { productId, cardNumber, cvv, name, expirationDate } = req.body;

    // Check if all required fields are present
    if (!cardNumber || !cvv || !name || !expirationDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Fetch the product to get the owner information
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get user info for notifications
    const buyer = await User.findById(buyerId, 'username');
    const seller = await User.findById(product.owner, 'username');

    const newPayment = new Payment({
      productBuyers: buyerId,
      productOwner: product.owner,
      cardNumber,
      cvv,
      name,
      expirationDate,
    });

    await newPayment.save();

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
    }

    res.status(201).json({
      message: 'Payment placed successfully',
      payment: newPayment,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};