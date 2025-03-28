// src/components/PetInfo.js
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Bidding.css';
import { NextArrow, PrevArrow } from './customArrow';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip, IconButton, CircularProgress } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import bidProduct from '../BidProduct/BidProductHome';


const Bidding = () => {
  const navigate = useNavigate(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/get`);
        setProducts(response.data); // Assuming response.data is an array of products
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <CircularProgress style={{ display: 'block', margin: 'auto' }} />;
  }

  return (
    <div className="slider-container" style={{ position: 'relative'}}>
      <h1>Explore Our Bidding Collection</h1>
      <Slider {...settings}>
        {products.map((product) => (
          <div className="slide-item" key={product.id}>
            <Card
              sx={{
                maxWidth: 270,
                height: 300,
                margin: '0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <CardMedia component="img" height="100" image={product.images && product.images[0]} alt={product.name} />
              <CardContent sx={{ padding: '8px' }}>
                {/* <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip label="On Stock" sx={{backgroundColor:"#829460"}} size="small" />
                  <Chip label={`${item.bids} Bids`} sx={{backgroundColor:"#7D9D9C",color:"white"}}size="small" />
                </Box> */}
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  noWrap
                  sx={{ fontSize: '14px', textAlign: 'center' }}
                >
                  {product.name}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Bid
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      Rs.{product.startingPrice}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Buy Now
                    </Typography>
                    {/* <Typography variant="body1" color="text.primary">
                      ${item.buyNowPrice.toFixed(2)}
                    </Typography> */}
                  </Box>
                </Box>
                <Button variant="contained" sx={{backgroundColor:"#85586F",color:"white"}} startIcon={<ShoppingCartIcon />} fullWidth  onClick={() => navigate(`/biddingProduct/${product._id}`)}>
                  PLACE BID
                </Button>
                <Box display="flex" justifyContent="center" mt={1}>
                  <IconButton color="default">
                    <FavoriteBorderIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </div>
        ))}
      </Slider>
      {/* See More Link */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: '10px',
          zIndex: 1,
        }}
      >
        <Button
          onClick={() => navigate('/bidProduct')} // Use navigate to redirect to BidProduct page
          style={{ textDecoration: 'none', fontSize: '16px',fontWeight: 'bold', color: 'darkblue' }}
        >
          See More
        </Button>
      </Box>
    </div>
  );
};

export default Bidding;
