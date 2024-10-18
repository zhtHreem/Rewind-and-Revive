import React, { useState } from "react";
import { Box, IconButton, Grid, Typography, Button, Divider } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './style.css';

const sampleProducts = [
  { id: 1, name: "Casual T-shirt", quantity: 1, price: 10, image: require("./assets/tshirt.jpg") },
  { id: 2, name: "Stylish Jeans", quantity: 2, price: 15, image: require("./assets/jeans.jpg") },
];

function AddCart({ open, onClose }) {
  const [products, setProducts] = useState(sampleProducts);
  const navigate = useNavigate();

  const handleIncrement = (id) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, quantity: product.quantity + 1 } : product
    ));
  };

  const handleDecrement = (id) => {
    setProducts(products.map(product =>
      product.id === id && product.quantity > 1
        ? { ...product, quantity: product.quantity - 1 } : product
    ));
  };

  return (
    <Box className="cart-drawer">
      {/* Header with Shopping Cart Icon */}
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

      {/* Product List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', paddingX: 2 }}>
        {products.map(product => (
          <Grid 
            container 
            key={product.id} 
            alignItems="center" 
            spacing={2} 
            sx={{ marginBottom: 3 }}
          >
            <Grid item>
              <Box
                component="img"
                src={product.image}
                alt={product.name}
                className="cart-image"
              />
            </Grid>
            <Grid item xs>
              <Typography>{product.name}</Typography>
            </Grid>
            <Grid item>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <IconButton
                    onClick={() => handleDecrement(product.id)}
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
                  <Typography>{product.quantity}</Typography>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() => handleIncrement(product.id)}
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
        ))}
      </Box>

      <Divider sx={{ marginY: 2 }} />

      {/* Footer Buttons */}
      <Grid container justifyContent="space-between" className="cart-footer">
        <Grid item xs={5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
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
            onClick={() => navigate('/payment')}
            className="cart-button"
            sx={{ backgroundColor: "#85586F", '&:hover': { backgroundColor: '#6A4C58' } }}
          >
            Checkout
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AddCart;
