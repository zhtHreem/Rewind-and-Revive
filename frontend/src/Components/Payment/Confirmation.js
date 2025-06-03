import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import Layout from '../Layout/layout';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#c23d4b',
    },
  },
};

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const savedCart = localStorage.getItem("cart");
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];

        const updatedCart = await Promise.all(
          parsedCart.map(async (item) => {
            if (!item.id) {
              console.error("Missing product ID:", item);
              return item;
            }
            const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/${item.id}`);
            return { ...item, ...response.data };
          })
        );

        setCart(updatedCart);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCartProducts();
  }, []);

  const getTotalPrice = () =>
    cart.reduce((total, product) => total + product.price * product.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    const cardElement = elements.getElement(CardElement);

    try {
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (methodError) {
        Swal.fire({ icon: 'error', title: methodError.message });
        setIsProcessing(false);
        return;
      }

      // Send payment info and cart to backend
      const res = await axios.post(
        `${process.env.REACT_APP_LOCAL_URL}/api/payment/create-payment-intent`,
        {
          paymentMethodId: paymentMethod.id,
          cartItems: cart,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token'),
          },
        }
      );

      const { clientSecret, status } = res.data;

      if (status === 'succeeded') {
        Swal.fire({
          icon: 'success',
          title: 'Payment successful!',
          text: 'Your order has been placed successfully.',
        });
        localStorage.removeItem("cart");
        cardElement.clear();
        navigate("/confirmation");
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);

      if (error) {
        Swal.fire({ icon: 'error', title: error.message });
      } else if (paymentIntent.status === 'succeeded') {
        Swal.fire({
          icon: 'success',
          title: 'Payment successful!',
          text: 'Your order has been placed successfully.',
        });
        localStorage.removeItem("cart");
        cardElement.clear();
        navigate("/confirmation");
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Payment Processing',
          text: 'We will notify you once your payment is confirmed.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: err.response?.data?.error || 'Something went wrong',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" mt={5}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
          <Typography variant="h5" gutterBottom>
            Complete Your Payment
          </Typography>
          <Typography variant="body1" gutterBottom>
            Total Amount: Rs.{getTotalPrice()}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ my: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="inherit"
              sx={{ mt: 2, color:"white",backgroundColor: '#85586F', '&:hover': { backgroundColor: '#6A4C58' } }}
              fullWidth
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Pay Now'}
            </Button>
          </form>
        </Paper>
      </Box>

      <Box display="flex" justifyContent="center" mt={1} mb={5}>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/cart')}>
          Back to Cart
        </Button>
      </Box>
    </Layout>
  );
};

export default PaymentForm;
