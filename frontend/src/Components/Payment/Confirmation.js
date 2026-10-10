import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { CircularProgress } from '@mui/material';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import Layout from '../Layout/layout';
import { ReceiptPaper, ReceiptRule, ReceiptRow, ReceiptBarcode, ReceiptNote, rs } from '../Receipt/Receipt';

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
      <div className="rr-receipt-page">
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <ReceiptPaper subtitle="secure payment · powered by Stripe">
            <ReceiptRule />
            {cart.map((product, i) => (
              <ReceiptRow
                key={product._id || product.id}
                left={`${String(i + 1).padStart(2, '0')} ${String(product.name || '').slice(0, 22)}`}
                right={rs(product.price * (product.quantity || 1))}
              />
            ))}
            <ReceiptRule />
            <ReceiptRow strong left="TOTAL" right={`Rs ${rs(getTotalPrice())}`} />
            <ReceiptRule />
            <ReceiptNote>Card details</ReceiptNote>
            <div className="rr-card-field">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
            <ReceiptBarcode />
          </ReceiptPaper>

          <div className="rr-receipt-page__actions">
            <button type="button" className="is-ghost" onClick={() => navigate(-1)}>Back</button>
            <button type="submit" className="is-solid" disabled={!stripe || isProcessing || cart.length === 0}>
              {isProcessing ? <CircularProgress size={20} color="inherit" /> : `Pay Rs ${rs(getTotalPrice())}`}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PaymentForm;
