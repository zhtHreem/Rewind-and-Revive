import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Typography, Button } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Layout from '../Layout/layout';
import ChatFeature from '../ChatFeature/ChatFeature';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import axios from 'axios';

const ProductPage = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [description, setDescription] = useState(false);
  const [size, setSize] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [mainImage, setMainImage] = useState('');
  const [slidesPerView, setSlidesPerView] = useState(4);
  const productId = "67555732d7527b45fdcde2f0";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/product/${productId}`);
        setProduct(response.data);
        console.log("product", response.data);
        if (response.data.images && response.data.images.length > 0) {
          setMainImage(response.data.images[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    if (productId) {
      fetchProduct();
    }

    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setSlidesPerView(3);
      } else if (window.innerWidth <= 900) {
        setSlidesPerView(4);
      } else {
        setSlidesPerView(5);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [productId]);

  const handleImageClick = (image) => {
    setMainImage(image);
  };

  if (!product) {
    return <Typography>Loading...</Typography>;
  }

  const sizeDetails = product.type === 'top/bottom' ? [
    { label: 'Top - Waist', value: `${product.topSizes.waist} inches` },
    { label: 'Top - Arm Length', value: `${product.topSizes.armLength} inches` },
    { label: 'Top - Hips', value: `${product.topSizes.hips} inches` },
    { label: 'Top - Shoulder Width', value: `${product.topSizes.shoulderWidth} inches` },
    { label: 'Top - Bust/Chest', value: `${product.topSizes.bustChest} inches` },
    { label: 'Top - Neck Circumference', value: `${product.topSizes.neckCircumference} inches` },
    { label: 'Bottom - Waist', value: `${product.bottomSizes.waist} inches` },
    { label: 'Bottom - Hips', value: `${product.bottomSizes.hips} inches` },
    { label: 'Bottom - Inseam', value: `${product.bottomSizes.inseam} inches` },
    { label: 'Bottom - Thigh Leg Opening', value: `${product.bottomSizes.thighLegOpening} inches` },
    { label: 'Bottom - Rise', value: `${product.bottomSizes.rise} inches` }
  ] : product.type === 'top' ? [
    { label: 'Waist', value: `${product.topSizes.waist} inches` },
    { label: 'Arm Length', value: `${product.topSizes.armLength} inches` },
    { label: 'Hips', value: `${product.topSizes.hips} inches` },
    { label: 'Shoulder Width', value: `${product.topSizes.shoulderWidth} inches` },
    { label: 'Bust/Chest', value: `${product.topSizes.bustChest} inches` },
    { label: 'Neck Circumference', value: `${product.topSizes.neckCircumference} inches` }
  ] : product.type === 'bottom' ? [
    { label: 'Waist', value: `${product.bottomSizes.waist} inches` },
    { label: 'Hips', value: `${product.bottomSizes.hips} inches` },
    { label: 'Inseam', value: `${product.bottomSizes.inseam} inches` },
    { label: 'Thigh Leg Opening', value: `${product.bottomSizes.thighLegOpening} inches` },
    { label: 'Rise', value: `${product.bottomSizes.rise} inches` }
  ] : [];

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, padding: 6 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: '100%', height: { xs: 300, md: 600, lg: 500 }, border: '1px solid #ccc', padding: 2, backgroundColor: '#f9f9f9' }}>
              <Box component="img" src={mainImage} alt="Main Product" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>

            <Swiper slidesPerView={slidesPerView} spaceBetween={10} pagination={{ clickable: true }} className="mySwiper" modules={[Pagination]} style={{ marginTop: '20px', height: 100 }}>
              {product.images.map((image, index) => (
                <SwiperSlide key={index} onClick={() => handleImageClick(image)}>
                  <Box component="img" src={image} alt={`Thumbnail ${index + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', border: mainImage === image ? '2px solid #007bff' : '2px solid transparent', transition: 'border-color 0.3s ease', '&:hover': { borderColor: '#0056b3' } }} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ px: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Typography variant="h2">{product.name}</Typography>

              <Typography variant="h4" sx={{ marginBottom: 2 }}>${product.price}</Typography>
              
              <Typography variant="overline" sx={{ marginLeft: '80%', cursor: 'pointer', '&:hover': { textDecoration: 'underline', color: 'primary.main' } }} onClick={() => navigate(`/profile/${product.owner._id}`)}>
                {product.owner.username}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" size="large" sx={{ width: '100%', backgroundColor: 'black', '&:hover': { backgroundColor: '#85586F' } }}>Add to Cart</Button>
                <Button variant="contained" size="large" sx={{ width: '100%', backgroundColor: '#85586F', '&:hover': { backgroundColor: 'black' } }}>Buy Now</Button>
              </Box>

              <Button onClick={() => setSize((prev) => !prev)} sx={{ color: 'black', width: '100%', borderBottom: '1px outset black', borderLeft: '1px outset black' }} endIcon={<KeyboardArrowDown />}>
                Size Detail
              </Button>
              
              {size && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      {sizeDetails.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>{detail.label}</TableCell>
                          <TableCell>{detail.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Button onClick={() => setShipping((prev) => !prev)} sx={{ color: 'black', width: '100%', borderBottom: '1px outset black', borderLeft: '1px outset black' }} endIcon={<KeyboardArrowDown />}>
                Shipping and return
              </Button>
              {shipping && <Typography>Shipping and return policy details.</Typography>}

              <Button onClick={() => setDescription((prev) => !prev)} sx={{ color: 'black', width: '100%', borderBottom: '1px outset black', borderLeft: '1px outset black' }} endIcon={<KeyboardArrowDown />}>
                Description
              </Button>
              {description && <Typography>{product.description}</Typography>}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <ChatFeature />
    </Layout>
  );
};

export default ProductPage;