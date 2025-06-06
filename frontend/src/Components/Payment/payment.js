import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Typography, Divider } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import Layout from '../Layout/layout';
import "./payment.css";

const Payment = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { productId }= useParams();

  // Fetch products from the backend (replace with correact endpoint)
  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const savedCart = localStorage.getItem("cart");
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];

        // Debugging to ensure products have valid IDs
        

        // Fetch product details from the backend (adjust API as needed)
        const updatedCart = await Promise.all(
          parsedCart.map(async (item) => {
            if (!item.id) {
              console.error("Product ID missing for item:", item);
              return item; // Skip this item if no id (or productId)
            }

            // Use the correct product ID from cart item
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

  return (
    <Layout>
    <Box className="payment-container">
      <Typography variant="h4" className="payment-title">
        Payment Summary
      </Typography>

      <table className="payment-table">
        <tbody>
          {cart.map((product) => (
            <tr key={product._id} className="payment-row">
              <td>
              <img  src={product.images?.[0] || "https://via.placeholder.com/100"} alt={product.name} className="product-image" />
              </td>
              <td className="product-name">{product.name}</td>
              <td className="product-price">
                {product.quantity} x Rs.{product.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Divider sx={{ my: 2 }} />

      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h6" className="total-label">Total</Typography>
        <Typography variant="h6" className="total-price">Rs.{getTotalPrice()}</Typography>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Box className="payment-buttons">
        <Button
          variant="outlined"
          onClick={() => navigate("/cart")}
          className="back-to-cart-btn"
          sx={{ color: "#85586F", borderColor: "#85586F" }}
        >
          Back to Cart
        </Button>
        <Button
          
          sx={{ backgroundColor: "#85586F",   color: "#fff", // Make sure text is readable on dark background
    '&:hover': {
      backgroundColor: "#6A4C58"
    }}}
          onClick={() => navigate('/confirmation', { state: { cart } })}
        
          variant="contained"
          disableElevation
  disableRipple
        >
          Pay Nowh
        </Button>
      </Box>
    </Box>
    </Layout>
  );
};

export default Payment;
