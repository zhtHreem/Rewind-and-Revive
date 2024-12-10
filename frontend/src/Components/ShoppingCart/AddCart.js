import React, { useEffect, useState } from "react";
import { Box, IconButton, Grid, Typography, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from "axios";
import './style.css'; // Import the CSS

// Replace this with a dynamic productId if needed
const productId = "67555732d7527b45fdcde2f0";

const AddCart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  // Fetch cart data from the API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/product/${productId}`);
        console.log("Fetched product data:", response.data); // Debugging line
        if (typeof setCart === "function") {
          setCart([response.data]); // Assuming the response is for a single product
        } else {
          console.error("setCart is not a function");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, [setCart]); // Ensure this runs only when setCart changes

  const handleIncrement = (id) => {
    setCart(
      cart.map((product) =>
        product._id === id ? { ...product, quantity: (product.quantity || 1) + 1 } : product
      )
    );
  };

  const handleDecrement = (id) => {
    setCart(
      cart.map((product) =>
        product._id === id && (product.quantity || 1) > 1
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
  };

  return (
    <Box className="cart-drawer">
      {/* Cart Header */}
      <Grid container className="cart-header" spacing={1}>
        <Grid item>
          <ShoppingCartIcon fontSize="large" sx={{ color: "#85586F" }} />
        </Grid>
        <Grid item>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#85586F" }}>
            Shopping Cart
          </Typography>
        </Grid>
      </Grid>

      {/* Cart Content */}
      <Box className="cart-content">
        {Array.isArray(cart) && cart.length > 0 ? ( // Ensure cart is an array and not empty
          cart.map((product) => (
            <Grid key={product._id} container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
              {/* Product Image */}
              <Grid item>
                <Box
                  component="img"
                  src={product.images?.[0] || "https://via.placeholder.com/100"}
                  alt={product.name}
                  className="cart-image"
                />
              </Grid>

              {/* Product Name */}
              <Grid item xs>
                <Typography>{product.name}</Typography>
              </Grid>

              {/* Quantity Controls */}
              <Grid item>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <IconButton
                      onClick={() => handleDecrement(product._id)}
                      sx={{
                        borderRadius: '50%',
                        bgcolor: '#F0F0F0',
                        '&:hover': { bgcolor: '#E0E0E0' },
                        width: 30,
                        height: 30,
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Typography>{product.quantity || 1}</Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={() => handleIncrement(product._id)}
                      sx={{
                        borderRadius: '50%',
                        bgcolor: '#F0F0F0',
                        '&:hover': { bgcolor: '#E0E0E0' },
                        width: 30,
                        height: 30,
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ))
        ) : (
          <Typography>Your cart is empty.</Typography> // Fallback message for empty cart
        )}
      </Box>

      {/* Footer Buttons */}
      <Divider sx={{ marginY: 2 }} />
      <Grid container justifyContent="space-between" className="cart-footer">
        <Grid item xs={5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate(-1)}
            className="cart-button"
            sx={{ color: "#85586F", borderColor: "#85586F" }}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item xs={5}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/payment")}
            className="cart-button"
            sx={{ backgroundColor: "#85586F", '&:hover': { backgroundColor: '#6A4C58' } }}
          >
            Checkout
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCart;
