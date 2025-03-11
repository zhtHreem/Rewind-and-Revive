import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../Utils/skeletonLoader';
import axios from 'axios';
axios.defaults.withCredentials = true;
const RecommendedProductsSection = ({ userId }) => {
  const navigate = useNavigate();
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState({});
  
  // Fallback data to use when API fails (for development/testing)
  const fallbackData = [
    {
      _id: 'fallback1',
      name: 'Sample Product 1',
      price: 99.99,
      images: ['/api/placeholder/400/400'],
      owner: { username: 'Demo Seller' }
    },
    {
      _id: 'fallback2',
      name: 'Sample Product 2',
      price: 149.99,
      images: ['/api/placeholder/400/400'],
      owner: { username: 'Demo Seller' }
    },
    {
      _id: 'fallback3',
      name: 'Sample Product 3',
      price: 199.99,
      images: ['/api/placeholder/400/400'],
      owner: { username: 'Demo Seller' }
    }
  ];

  // Flag to determine if we should use fallback data
  const useFallbackData = process.env.NODE_ENV === 'development';

const fetchRecommendations = async () => {
  try {
    setLoading(true);
    setError(null);
     console.log('API Response:aaaaaaaa');
    const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/recommendations`, {
       withCredentials: true,  // This is crucial - make sure it's working
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response:', response.data);
    
    if (response.data.success) {
      setRecommendedProducts(response.data.recommendations || []);
    } else {
      throw new Error(response.data.message || 'API returned unsuccessful response');
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    setError(error.message);
    
    // Optionally use fallback data here if needed
    if (useFallbackData) {
      setRecommendedProducts(fallbackData);
    }
  } finally {
    setLoading(false);
  }
};
// Add this useEffect to call fetchRecommendations when the component mounts
useEffect(() => {
  fetchRecommendations();
}, []);

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

  if (loading) {
    return (
      <Box >
        <Box  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 'auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Recommended For You
          </Typography>
        </Box>
        <Grid container spacing={2} >
          {Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
              <ProductCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Show error message if there was an error
  if (error) {
    return (
      <Box p={12}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          Recommended For You
        </Typography>
        <Typography color="error">
          Unable to load recommendations. Please try again later.
        </Typography>
        {process.env.NODE_ENV === 'development' && (
          <Typography variant="body2" color="text.secondary">
            Error details: {error}
          </Typography>
        )}
      </Box>
    );
  }

  // Don't show the section if there are no recommendations
  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <Box  sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, height: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Recommended For You
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {recommendedProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={product._id}>
            <Box 
              sx={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', aspectRatio: '3/4' }}
              onMouseEnter={() => handleCardHover(product._id)} 
              onMouseLeave={handleCardLeave}
            >
              {/* Skeleton Loading */}
              {!imagesLoaded[product._id] && (
                <Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
                  <ProductCardSkeleton />
                </Box>
              )}

              {/* Front of the card */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  transition: 'transform 0.6s',
                  transform: hoveredCard === product._id ? 'translateY(-100%)' : 'translateY(0%)',
                  opacity: imagesLoaded[product._id] ? 1 : 0,
                }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardMedia sx={{ height: 400, width: '100%', backgroundColor: '#f0f0f0' }}>
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      loading="lazy" 
                      onLoad={() => handleImageLoad(product._id)} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </CardMedia>
                  <CardContent>
                    <Typography textAlign={'start'} variant="h6">
                      {product.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Rs.{product.price}
                    </Typography>
                    <Typography textAlign={'end'} variant="body2" color="text.secondary">
                      {/* Display seller name if available */}
                      {product.owner?.username }
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Back of the card (Price Card) */}
              <Box 
                sx={{ 
                  fontFamily: 'Helvetica Neue', 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%', 
                  backgroundImage: imagesLoaded[product._id] ? `url(${product.images[0]})` : 'none', 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center', 
                  color: 'white', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  transition: 'transform 0.6s', 
                  transform: hoveredCard === product._id ? 'translateY(0%)' : 'translateY(100%)', 
                  p: 2, 
                  opacity: imagesLoaded[product._id] ? 1 : 0 
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 100, mb: 2 }}>
                  Only For
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Rs {product.price}
                </Typography>
                <Typography variant="body2" sx={{ color: 'black', padding: '4px 8px', fontWeight: 'bold' }}>
                                          Seller: <Typography component="span" sx={{ color: 'white', fontWeight: 'normal', cursor: 'pointer', marginLeft: '4px', textDecoration: 'underline' }} onClick={() => navigate(`/profile/${product.owner?._id}`)}>{product.owner?.username}</Typography>
                 </Typography>     
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate(`/product/${product._id}`)} 
                  sx={{ 
                    mt: 6, 
                    background: 'linear-gradient(135deg, brown 50%, #867070 50%)', 
                    transform: 'scale(1.25)', 
                    transition: 'transform 0.3s ease', 
                    willChange: 'transform' 
                  }} 
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.25)'} 
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
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

export default RecommendedProductsSection;