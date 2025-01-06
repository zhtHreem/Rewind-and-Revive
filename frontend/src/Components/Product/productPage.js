import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Typography, Button } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Layout from '../Layout/layout';
import ProductChat from '../ProductChat/ProductChat';
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
  const [cart, setCart] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [slidesPerView, setSlidesPerView] = useState(4);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const productId = "67720e9813993fae4cbcfadd";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/product/${productId}`);
        setProduct(response.data);
        if (response.data.images?.length > 0) {
          setMainImage(response.data.images[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();

    const handleResize = () => {
      setSlidesPerView(window.innerWidth <= 600 ? 3 : window.innerWidth <= 900 ? 4 : 5);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddToCart = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/product/${productId}`);
      setCart((prevCart) => [...prevCart, response.data]);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const handleImageClick = (image) => setMainImage(image);

  if (!product) return <Typography>Loading...</Typography>;

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
                  <Box component="img" src={image} alt={`Thumbnail ${index + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', border: mainImage === image ? '2px solid #007bff' : '2px solid transparent' }} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ px: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Typography variant="h2">{product.name}</Typography>
              <Typography variant="h4">${product.price}</Typography>
              <Typography variant="overline" sx={{ cursor: 'pointer' }} onClick={() => product.owner ? navigate(`/profile/${product.owner._id}`) : null}>
                {product.owner?.username || 'Unknown Owner'}
              </Typography>
              <Button variant="contained" onClick={handleAddToCart}>Add to Cart</Button>

              <Button onClick={() => setSize(!size)} endIcon={<KeyboardArrowDown />}>Size Details</Button>
              {size && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      {product.sizeDetails.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>{detail.label}</TableCell>
                          <TableCell>{detail.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Button onClick={() => setShipping(!shipping)} endIcon={<KeyboardArrowDown />}>Shipping and Returns</Button>
              {shipping && <Typography>Shipping and return policy details.</Typography>}

              <Button onClick={() => setDescription(!description)} endIcon={<KeyboardArrowDown />}>Description</Button>
              {description && <Typography>{product.description}</Typography>}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Floating Chat Button */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#007bff', color: 'white', padding: '10px 15px', borderRadius: '30px', cursor: 'pointer' }} onClick={() => setIsChatOpen(!isChatOpen)}>💬 Chat</div>
      {isChatOpen && <ProductChat productId={productId} ownerId={product.owner?._id} />}
    </Layout>
  );
};

export default ProductPage;
