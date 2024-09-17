// src/components/PetInfo.js
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Bidding.css';
import { NextArrow, PrevArrow } from './customArrow';
import chanel from '../../assets/Bidding/chanel.jpg';
import chanel2 from '../../assets/Bidding/channel page.jpg';
import LV from '../../assets/Bidding/LV.jpg';
import prada from '../../assets/Bidding/prada.jpg';
import gucci from '../../assets/Bidding/gucci.jpg';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import bidProduct from '../BidProduct/BidProductHome';

const items = [
  {
    id: 1,
    image: chanel,
    title: 'Cream Colour Premium Chanel',
    currentBid: 8000.0,
    buyNowPrice: 8000.0,
    bids: 1,
  },
  {
    id: 2,
    image: chanel2,
    title: 'Black Chanel Premium',
    currentBid: 5001.0,
    buyNowPrice: 5000.0,
    bids: 1,
  },
  {
    id: 3,
    image: LV,
    title: 'Limited Edition LV',
    currentBid: 2002.0,
    buyNowPrice: 2000.0,
    bids: 1,
  },
  {
    id: 4,
    image: prada,
    title: 'Classic Prada Handbag',
    currentBid: 3000.0,
    buyNowPrice: 4000.0,
    bids: 3,
  },
  {
    id: 5,
    image: gucci,
    title: 'Vintage Bag',
    currentBid: 7000.0,
    buyNowPrice: 10000.0,
    bids: 5,
  },
];

const Bidding = () => {
  const navigate = useNavigate(); // Initialize useNavigate

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

  return (
    <div className="slider-container" style={{ position: 'relative' }}>
      <h1>Explore Our Bidding Collection</h1>
      <Slider {...settings}>
        {items.map((item) => (
          <div className="slide-item" key={item.id}>
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
              <CardMedia component="img" height="100" image={item.image} alt={item.title} />
              <CardContent sx={{ padding: '8px' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip label="On Stock" sx={{backgroundColor:"#829460"}} size="small" />
                  <Chip label={`${item.bids} Bids`} sx={{backgroundColor:"#7D9D9C",color:"white"}}size="small" />
                </Box>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  noWrap
                  sx={{ fontSize: '14px', textAlign: 'center' }}
                >
                  {item.title}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Bid
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      ${item.currentBid.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Buy Now
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      ${item.buyNowPrice.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <Button variant="contained" sx={{backgroundColor:"#576F72",color:"white"}} startIcon={<ShoppingCartIcon />} fullWidth>
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
