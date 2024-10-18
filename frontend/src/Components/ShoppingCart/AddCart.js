// AddCart.js
import React, { useState } from "react";
import { Box, IconButton, Stack, Typography, Button, Divider } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import payment from '../Payment/payment'

// Sample product data with images
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
    <Box
      sx={{
        width: 300, // Increased width for better layout with images
        height: '100vh',
        position: 'fixed',
        top: 0,
        right: 0,
        bgcolor: 'white',
        boxShadow: 5,
        zIndex: 1300,
        overflowY: 'auto',
        padding: 2,
      }}
    >
      {/* Header with Shopping Cart Icon */}
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="center" 
        spacing={1} 
        sx={{ marginBottom: 2 }}
      >
        <ShoppingCartIcon fontSize="large" sx={{ color: "#85586F" }} />
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#85586F" }}>
          Shopping Cart
        </Typography>
      </Stack>

      {/* Product List with Images */}
      {products.map(product => (
        <Stack
          key={product.id}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <Box
            component="img"
            src={product.image}
            alt={product.name}
            sx={{ width: 40, height: 50, borderRadius: '8px', objectFit: 'cover' }}
          />
          <Typography sx={{ flexGrow: 1 }}>{product.name}</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
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
            <Typography>{product.quantity}</Typography>
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
          </Stack>
        </Stack>
      ))}

      <Divider sx={{ marginY: 2 }} />

      {/* Footer Buttons */}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ color: "#85586F", borderColor: "#85586F" }}
        >
          Cancel Order
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/payment')}
          sx={{ backgroundColor: "#85586F", '&:hover': { backgroundColor: '#6A4C58' } }}
        >
          Checkout
        </Button>
      </Stack>
    </Box>
  );
}

export default AddCart;
