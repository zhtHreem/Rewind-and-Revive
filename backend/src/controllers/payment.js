import Payment from "../models/payment.js";
import Product from '../models/product.js';

export const addPayment = async (req, res) => {
  try {
    const user = req.user.id;
    const { productId, cardNumber, cvv, name, expirationDate } = req.body;

    // Log the data for debugging
    console.log('Received Payment Data:', {
      productId,
      cardNumber,
      cvv,
      name,
      expirationDate,
    });

    // Check if all required fields are present
    if (!cardNumber || !cvv || !name || !expirationDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Fetch the product to get the owner information
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    
    const newPayment = new Payment({
      productBuyers: user,  
      productOwner: product.owner,  
      cardNumber,  
      cvv,
      name,
      expirationDate,  
    });

    
    await newPayment.save();

    
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
