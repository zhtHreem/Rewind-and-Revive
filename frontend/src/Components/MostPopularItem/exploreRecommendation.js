import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../Utils/skeletonLoader';
import axios from 'axios';

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

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check the correct URL
        const apiUrl = `${process.env.REACT_APP_LOCAL_URL}/api/recommendations`;
        console.log('Fetching recommendations from:', apiUrl);
        
        // Get recommendations using Axios
        const response = await axios.get(apiUrl);
        
        console.log('API Response:', response.data);
        
        if (response.data.success) {
          setRecommendedProducts(response.data.recommendations);
        } else {
          throw new Error(response.data.message || 'API returned unsuccessful response');
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        
        // Handle Axios specific errors
        if (error.response) {
          // The request was made and the server responded with a status code outside of 2xx
          const statusCode = error.response.status;
          setError(`Server returned error: ${statusCode} ${error.response.statusText}`);
          
          // For 404 errors, we might want to use fallback data in development
          if (statusCode === 404 && useFallbackData) {
            console.log('Using fallback recommendation data');
            setRecommendedProducts(fallbackData);
            setError(null); // Clear error since we're using fallback data
          } else {
            setRecommendedProducts([]);
          }
        } else if (error.request) {
          // The request was made but no response was received
          setError('No response received from server. Check your network connection.');
          
          // Use fallback data in development
          if (useFallbackData) {
            console.log('Using fallback recommendation data due to network error');
            setRecommendedProducts(fallbackData);
            setError(null);
          } else {
            setRecommendedProducts([]);
          }
        } else {
          // Something happened in setting up the request
          setError(error.message);
          setRecommendedProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]); // Re-fetch when user ID changes (login/logout)

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
      <Box p={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, height: 'auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Recommended For You
          </Typography>
        </Box>
        <Grid container spacing={2}>
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
    <Box p={12}>
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
                      ${product.price}
                    </Typography>
                    <Typography textAlign={'end'} variant="body2" color="text.secondary">
                      {/* Display seller name if available */}
                      {product.owner?.username || 'Hareem'}
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