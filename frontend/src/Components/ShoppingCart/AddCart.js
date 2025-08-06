import React, { useEffect, useState } from "react";
import { Box, IconButton, Grid, Typography, Button, Divider } from "@mui/material";
import { useNavigate ,useParams} from 'react-router-dom';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from "axios";
import './style.css'; // Import the CSS
import { CardTravel } from "@mui/icons-material";


const AddCart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const { productId }= useParams();

  // Fetch cart data from the API
  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const updatedCart = await Promise.all(
          cart.map(async (item) => {
            // Fetch product data from API using item.id
            const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/${item.id}`);
            return { ...item, ...response.data }; // Merge response data with item data
          })
        );
        setCart(updatedCart); // Update cart with the fetched data
        console.log('Saving cart to localStorage:', updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart)); // Save updated cart to localStorage
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    // Only fetch product data if cart has items
    if (cart.length > 0) {
      fetchCartProducts();
    }
  }, []); // Only re-run when the cart changes (fetch updated product details)
  
  
  

  const handleIncrement = (id) => {
    setCart(prevCart => 
      prevCart.map(product => 
        productId === id ? { ...product, quantity: (product.quantity || 1) + 1 } : product
      )
    );
  };
  
  const handleDecrement = (id) => {
    setCart((prevCart) => {
      const updatedCart = prevCart
        .map((product) => {
          if (product.id === id && product.quantity > 1) {
            // Decrement the quantity if it's greater than 1
            return { ...product, quantity: product.quantity - 1 };
          }
          if (product.id === id && product.quantity <= 1) {
            // Remove the product if quantity is 1 or 0
            return null; // Mark the product for removal
          }
          return product;
        })
        .filter((product) => product !== null); // Filter out null values (deleted products)
  
      // Save the updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));
  
      return updatedCart; // Return the updated cart state
    });
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
          <Typography>Your cart is empty.</Typography> 
        )}
      </Box>

      {/* Footer Buttons */}
      <Divider sx={{ marginY: 2 }} />
      <Grid container justifyContent="space-between" className="cart-footer">
        <Grid item xs={5}>
          <Button  fullWidth   variant="outlined"          onClick={() => {if (window.history.length > 1) {  navigate(-1);   } else {  navigate("/"); }}} className="cart-button"  sx={{ color: "#85586F", borderColor: "#85586F" }}>
            Back 
          </Button>
        </Grid>

        <Grid item xs={5}>
          <Button  fullWidth variant="contained" onClick={() => {
    if (cart.length > 0) {
      navigate('/payment');
    } else {
      alert("Your cart must have at least one item before proceeding to checkout.");
    }
  }}className="cart-button"sx={{ backgroundColor: "#85586F", '&:hover': { backgroundColor: '#6A4C58' } }}>
  Checkout
        </Button>

        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCart;
