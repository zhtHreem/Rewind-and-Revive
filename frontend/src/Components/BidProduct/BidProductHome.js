import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout/layout';
import SkeletonLoader from "../Utils/skeletonLoader";

const ProductCardSkeleton = () => (
  <Card>
    <SkeletonLoader height="200px" />
    <CardContent>
      <SkeletonLoader.Text lines={1} width="80%" />
      <SkeletonLoader.Text lines={1} width="40%" />
      <SkeletonLoader.Text lines={1} width="60%" />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SkeletonLoader width="30%" height="20px" />
      </Box>
    </CardContent>
  </Card>
);

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ width: '100%', maxWidth: 350, position: 'relative' }}>
      <CardMedia
        component="img"
        height="130"
        image={product.images?.[0] || '/placeholder.jpg'} // Fallback image
        alt={product.name}
      />
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Starting Price: Rs.{product.startingPrice}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(`/biddingProduct/${product._id}`)}
          sx={{
            backgroundColor: '#85586F',
            mt: 2,
            '&:hover': {
              backgroundColor: '#354259',
            },
          }}
        >
          View Product
        </Button>
      </CardContent>
    </Card>
  );
};

const BidProductHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/get`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Layout>
      <Box
        p={5}
        sx={{
          flexGrow: 1,
          backgroundColor: '#F0EBE3',
        }}
      >
        <Typography
          textAlign="center"
          variant="h4"
          sx={{ backgroundColor: '#EAD7E0', color: '#4A3F55', py: 2, mb: 4  }}
        >
          Explore our Bidding Products
        </Typography>
        <Grid
          container
          spacing={3}
          justifyContent="center"
        >
          {loading
            ? Array.from(new Array(8)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
                  <ProductCardSkeleton />
                </Grid>
              ))
            : products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
        </Grid>
      </Box>
    </Layout>
  );
};

export default BidProductHome;
