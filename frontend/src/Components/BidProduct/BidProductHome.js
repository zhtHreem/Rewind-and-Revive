import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout/layout';


const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ width: 350, position: 'relative' }}>
      <CardMedia
        component="img"
        height="130"
        image={product.images && product.images[0]}
        alt={product.name}
      />
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Starting Price: ${product.startingPrice}
        </Typography>
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
        const response = await axios.get('http://localhost:5000/api/biddingProduct/get'); // Adjust URL as needed
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
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
      </Layout>
    </>
  );
};

export default BidProductHome;
