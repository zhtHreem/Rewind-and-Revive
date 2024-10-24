import React, { useState } from "react";
import { Box, Button, Grid, Typography, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./payment.css"; 

const sampleProducts = [
  { id: 1, name: "Casual T-shirt", quantity: 1, price: 700, image: require("./assets/tshirt.jpg") },
  { id: 2, name: "Stylish Jeans", quantity: 2, price: 850, image: require("./assets/jeans.jpg") },
  { id: 3, name: "Sneakers", quantity: 1, price: 1500, image: require("./assets/sneakers.jpg") },
  { id: 4, name: "Jacket", quantity: 1, price: 2000, image: require("./assets/jacket.jpg") },
];

function Payment() {
  const [products] = useState(sampleProducts);
  const navigate = useNavigate();

  const getTotalPrice = () =>
    products.reduce((total, product) => total + product.price * product.quantity, 0);

  return (
    <Box className="payment-container">
      <Typography variant="h4" className="payment-title">
        Payment Summary
      </Typography>

      <table className="payment-table">
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="payment-row">
              <td>
                <img src={product.image} alt={product.name} className="product-image" />
              </td>
              <td className="product-name">
                {product.name}
              </td>
              <td className="product-price">
                {product.quantity} x ${product.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Divider sx={{ my: 2 }} />

      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h6" className="total-label">Total</Typography>
        <Typography variant="h6" className="total-price">${getTotalPrice()}</Typography>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Box className="payment-buttons">
        <Button
          variant="outlined"
          onClick={() => navigate("/c")}
          className="back-to-cart-btn"
          sx={{ color: "#85586F", borderColor: "#85586F" }}
        >
          Back to Cart
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#85586F", '&:hover': { backgroundColor: '#6A4C58' } }}
          onClick={() => navigate("/confirmation")}
          className="pay-now-btn"
        >
          Pay Now
        </Button>
      </Box>
    </Box>
  );
}

export default Payment;
