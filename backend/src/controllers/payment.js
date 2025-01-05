import Payment from "../models/payment.js";

export const addPayment = async (req, res) => {
  try {
    // Extract data from the request body directly
    const { cardNumber, cvv, name, expirationDate } = req.body;

    // Log the data for debugging
    console.log('Received Payment Data:', {
      cardNumber,
      cvv,
      name,
      expirationDate,
    });

    // Check if all required fields are present
    if (!cardNumber || !cvv || !name || !expirationDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new payment record
    const newPayment = new Payment({
      cardNumber, // Save as 'number' in the database
      cvv,
      name,
      expirationDate, // Save as 'expDate' in the database
    });

    // Save the payment to the database
    await newPayment.save();

    // Respond with a success message and the saved payment
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
