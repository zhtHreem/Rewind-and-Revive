import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { productId } = useParams();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    try {
      setIsProcessing(true);
      const cardElement = elements.getElement(CardElement);
      
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      if (methodError) {
        console.error(methodError);
        Swal.fire({ icon: 'error', title: methodError.message });
        setIsProcessing(false);
        return;
      }
      
      console.log("Submitting payment with paymentMethodId:", paymentMethod.id);
      console.log("Submitting payment with productId:", productId);
      
      const res = await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/payment/create-payment-intent`, {
        paymentMethodId: paymentMethod.id,
        productId,
      }, {
        headers: {
          'Content-Type': 'application/json',
           Authorization: localStorage.getItem('token'),
         },
      });
      
      const { clientSecret, status } = res.data;
      
      // Check if payment was already successful (from automatic confirmation)
      if (status === 'succeeded') {
        Swal.fire({ 
          icon: 'success', 
          title: 'Payment successful!',
          text: 'Your order has been placed successfully.'
        });
        cardElement.clear();
        return;
      }
      
      // Otherwise, handle client-side confirmation
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
      
      if (error) {
        Swal.fire({ icon: 'error', title: error.message });
      } else if (paymentIntent.status === 'succeeded') {
        Swal.fire({ 
          icon: 'success', 
          title: 'Payment successful!',
          text: 'Your order has been placed successfully.'
        });
        cardElement.clear();
      } else {
        Swal.fire({ 
          icon: 'info', 
          title: 'Payment processing',
          text: 'Your payment is being processed. We will notify you once completed.'
        });
      }
    } catch (err) {
      console.error('Payment failed:', err);
      Swal.fire({ 
        icon: 'error', 
        title: 'Payment Failed',
        text: err.response?.data?.error || 'Something went wrong with your payment'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
    <>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" mt={5}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
          <Typography variant="h5" gutterBottom>Complete Your Payment</Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ my: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Pay Now'}
            </Button>
          </form>
        </Paper>
      </Box>
  
      <Box display="flex" justifyContent="center" mt={1} mb={5}>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </Box>
    </>
    </Layout>
  );
};  
  

export default PaymentForm;