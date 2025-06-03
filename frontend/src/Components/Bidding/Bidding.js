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
import { Circle } from '@mui/icons-material';


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
      
       <Box sx={{ display: 'flex', flexDirection:"column",justifyContent: 'center', alignItems: 'center', mb: 5, height: 'auto',borderTop: '2px inset #867070',borderBottom:"2px inset #867070", paddingTop: '16px', marginBottom: '32px'}}>
              <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif',fontWeight: 'bold', textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)', }}>
                Explore Our Bidding Products
              </Typography>
              <Typography variant="bodyv2" sx={{fontFamily: 'Lato, serif',marginBottom:2, textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)',}}>Bid, Win, and Style Sustainably</Typography>
            </Box>
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
              
              {/* <CardMedia component="img" height="150" image={product.images && product.images[0]} alt={product.name} /> */}
              <CardMedia component="div"  sx={{     height: 150,position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box component="img" src={product.images && product.images[0]} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </CardMedia>
              <CardContent sx={{ padding: '8px' }}>
               

                
                    <Typography textAlign={'start'} variant="h6" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 200 }} noWrap>

                  {product.name}
                </Typography>
                <Box display="flex"  alignItems="center" mb={1}>
                  
                    <Typography variant="body2" color="text.secondary">
                      Current Bid
                    </Typography>
                    <Typography variant="body1" color="text.primary" sx={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
                    <IconButton aria-label="add to favorites" size="small" sx={{color:"green"}}>
                    < Circle sx={{ fontSize: '10px' }} />
                    </IconButton>
                      {/* Assuming product.startingPrice is a number */}
                      Rs.{product.startingPrice}
                    </Typography>
                 
                  <Box>
                   
                  
                  </Box>
                </Box>
                <Button variant="contained" sx={{backgroundColor:"#85586F",color:"white"}} startIcon={<ShoppingCartIcon />} fullWidth  onClick={() => navigate(`/biddingProduct/${product._id}`)}>
                  PLACE BID
                </Button>
               
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
