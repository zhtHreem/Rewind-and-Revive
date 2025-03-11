import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography, Chip, Button } from '@mui/material';
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
    <Card sx={{ width: 350, position: 'relative' }}>
      {/* Product Image */}
      <CardMedia
        component="img"
        height="130"
        image={product.images && product.images[0]} // Use the first image if available
        alt={product.name}
      />
      {/* Product Content */}
      <CardContent>
        {/* Product Name */}
        <Typography variant="h6">{product.name}</Typography>
        {/* Product Description */}
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
        {/* Starting Price */}
        <Typography variant="body2" color="text.secondary">
          Starting Price: Rs.{product.startingPrice}
        </Typography>
        {/* View Product Button */}
        <Button
          variant="contained"
          onClick={() => navigate(`/biddingProduct/${product._id}`)}
          sx={{
            backgroundColor: '#576F72',
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
        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/get`); // Adjust URL as needed
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      } finally {
        setLoading(false);
    }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <Typography textAlign="center">Loading...</Typography>;
  }

  return (
    <>
      <Layout>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        {loading ? (
           // Show skeletons while loading
           Array(8).fill(0).map((_, index) => (
           <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
             <ProductCardSkeleton />
           </Grid>
      ))
     ) : (
        <Box
          p={10}
          sx={{
            flexGrow: 1,
            backgroundColor: '#F0EBE3',
          }}
        >
          <Typography
            textAlign="center"
            variant="h3"
            sx={{ backgroundColor: '#D1D1D1' }}
          >
            Explore our Bidding Products
          </Typography>
          <Grid
            container
            spacing={5}
            sx={{
              display: 'flex',
              gap: 0,
              margin: 0,
            }}
          >
            {products.map((product) => (
              <Grid item key={product._id} md={4}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>
     )}
     </Grid>
      </Layout>
    </>
  );
};

export default BidProductHome;
