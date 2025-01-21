import React, { useState } from 'react';
import { Box, Typography, Grid, Link, Card, CardMedia, CardContent, Button, Skeleton } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import SkeletonLoader from '../Utils/skeletonLoader';
const PopularFabricsSection = () => {
  const navigate = useNavigate();
  const products = [
    { id: 1, name: 'White Kurti', image: require('./images/desiwhitekurta.webp'), price: 120, category: 'women', subcategory: 'dresses', size: 'M' },
    { id: 2, name: 'Navy Blue Shirt', image: require('./images/navymenshirt.jpg'), price: 40, category: 'women', subcategory: 'tops', size: 'S' },
    { id: 3, name: 'Black Shirt', image: require('./images/blackmen.avif'), price: 80, category: 'women', subcategory: 'pants', size: 'L' },
    { id: 4, name: 'Brown Frock', image: require('./images/brown frock.jpg'), price: 250, category: 'men', subcategory: 'pants', size: 'L' },
    { id: 5, name: 'Offwhite-Dress', image: require('./images/offwhitegownwomen.webp'), price: 100, category: 'men', subcategory: 'shirt', size: 'M' },
    { id: 6, name: 'Black Outfit', image: require('./images/maninblack.jpeg'), price: 90, category: 'women', subcategory: 'skirts', size: 'S' },
  ];

  const [hoveredCard, setHoveredCard] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState({});

  const handleCardHover = (id) => {
    setHoveredCard(id);
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
  };

  const handleImageLoad = (productId) => {
    setImagesLoaded(prev => ({
      ...prev,
      [productId]: true
    }));
  };

   // Replace your current ProductCardSkeleton with this:
  const ProductCardSkeleton = () => (
    <Card sx={{ height: '500px' }}>
      <SkeletonLoader height="400px" />
      <CardContent>
        <SkeletonLoader.Text lines={1} width="60%" />
        <SkeletonLoader.Text lines={1} width="30%" />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SkeletonLoader width="20%" height="20px" />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box p={12}>
      <Box  sx={{  display: 'flex', justifyContent: 'space-between',  alignItems: 'center', mb: 3,  height: 'auto', }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Most Popular Fabrics
        </Typography>
        <Link href="#" underline="hover" sx={{ color: 'black', fontSize: '14px' }}>
          View All
        </Link>
      </Box>

      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={product.id}>
            <Box sx={{  position: 'relative',   width: '100%',  height: '500px',overflow: 'hidden',  aspectRatio: '3/4',  }}  onMouseEnter={() => handleCardHover(product.id)} onMouseLeave={handleCardLeave}>
              {/* Skeleton Loading */}
              {!imagesLoaded[product.id] && (
                <Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
                  <ProductCardSkeleton />
                </Box>
              )}

              {/* Front of the card */}
              <Box  sx={{ position: 'absolute', width: '100%', height: '100%',  transition: 'transform 0.6s', transform: hoveredCard === product.id ? 'translateY(-100%)' : 'translateY(0%)',opacity: imagesLoaded[product.id] ? 1 : 0,}}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia sx={{ height: 400, width: '100%', backgroundColor: '#f0f0f0' }}><img src={product.image} alt={product.name} loading="lazy" onLoad={() => handleImageLoad(product.id)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></CardMedia>
                  <CardContent>
                    <Typography textAlign={'start'} variant="h6">
                      {product.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      ${product.price}
                    </Typography>
                    <Typography textAlign={'end'} variant="body2" color="text.secondary">
                      Hareem
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Back of the card (Price Card) */}
              <Box sx={{ fontFamily: 'Helvetica Neue', position: 'absolute', width: '100%', height: '100%', backgroundImage: imagesLoaded[product.id] ? `url(${product.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transition: 'transform 0.6s', transform: hoveredCard === product.id ? 'translateY(0%)' : 'translateY(100%)', p: 2, opacity: imagesLoaded[product.id] ? 1 : 0 }} >

                <Typography variant="body2" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 100, mb: 2 }}>
                  Only For
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Rs {product.price}
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/product')} sx={{ mt: 6, background: 'linear-gradient(135deg, brown 50%, #867070 50%)', transform: 'scale(1.25)', transition: 'transform 0.3s ease', willChange: 'transform' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.25)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                  Buy Now
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PopularFabricsSection;