import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Typography, Divider } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../Layout/layout";

const Payment = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { productId } = useParams();

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const savedCart = localStorage.getItem("cart");
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];
        const updatedCart = await Promise.all(
          parsedCart.map(async (item) => {
            if (!item.id) {
              console.error("Product ID missing for item:", item);
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

  const getTotalPrice = () => cart.reduce((total, product) => total + product.price * product.quantity, 0);

  return (
    <Layout>
      <Box sx={{ maxWidth: 600, width: "90%", mx: "auto", my: 4, p: 3, bgcolor: "#fff", boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" sx={{ textAlign: "center", mb: 3 }}>Payment Summary</Typography>

        {cart.map((product) => (
          <Grid container key={product._id} spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={3}>
              <Box component="img" src={product.images?.[0] || "https://via.placeholder.com/100"} alt={product.name} sx={{ width: "100%", borderRadius: 1 }} />
            </Grid>
            <Grid item xs={5}>
              <Typography variant="body1" fontWeight={500}>{product.name}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">{product.quantity} x Rs.{product.price}</Typography>
            </Grid>
          </Grid>
        ))}

        <Divider sx={{ my: 2 }} />

        <Grid container justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">Rs.{getTotalPrice()}</Typography>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ color: "#85586F", borderColor: "#85586F", flex: 1, minWidth: 120 }}>Back to Cart</Button>
          <Button variant="contained" onClick={() => navigate("/confirmation", { state: { cart } })} sx={{ backgroundColor: "#85586F", color: "#fff", "&:hover": { backgroundColor: "#6A4C58" }, flex: 1, minWidth: 120 }}>Pay Now</Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default Payment;
