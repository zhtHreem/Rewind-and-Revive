import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper} from '@mui/material';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Layout from '../Layout/layout';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

const item = {
  username: "Seller name",
  name: "Product name",
  price: "200",
  description: "This is the product description.",
  sizeDetail: [
    { label: 'Waist', value: '32 inches' },
    { label: 'Arm Length', value: '25 inches' },
    { label: 'Hips', value: '40 inches' },
    { label: 'Shoulder Width', value: '18 inches' },
    { label: 'Bust/Chest', value: '36 inches' },
    { label: 'Neck Circumference', value: '15 inches' }
  ],
  shippingAndReturn: "Shipping and return policy details."
};

const ProductPage = () => {
  const [description, setDescription] = useState(false);
  const [size, setSize] = useState(false);
  const [shipping, setShipping] = useState(false);
  
  const images = [
    require('./images/1.jpg'),
    require('./images/2.jpg'),
    require('./images/3.jpg'),
    require('./images/4.jpg'),
    require('./images/5.jpg'),
  ];

  const [mainImage, setMainImage] = useState(images[0]);

  const handleImageClick = (image) => {
    setMainImage(image);
  };

  const [slidesPerView, setSlidesPerView] = useState(4);

  useEffect(() => {
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
  }, []);

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, padding: 6 }}>
        <Grid container spacing={2}>
          {/* Main Image */}
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ width:"100%", height: { xs: 300, md: 600, lg: 500 }, border: '1px solid #ccc', padding: 2, backgroundColor: '#f9f9f9' }}>
              <Box component="img" src={mainImage} alt="Main Product" sx={{ width: '100%', height: '100%', objectFit: "contain" }} />
            </Box>

            {/* Thumbnails with Swiper */}
            <Swiper
              slidesPerView={slidesPerView}
              spaceBetween={10}
              pagination={{ clickable: true }}
              className="mySwiper"
              modules={[Pagination]}
              style={{ marginTop: '20px',height:100 }}
            >
              {images.map((image, index) => (
                <SwiperSlide key={index} onClick={() => handleImageClick(image)}>
                  <Box component="img"  src={image} alt={`Thumbnail ${index + 1}`} sx={{ width: "100%",  height: "100%", objectFit: "cover", cursor: 'pointer', border: mainImage === image ? '2px solid #007bff' : '2px solid transparent', transition: 'border-color 0.3s ease','&:hover': { borderColor: '#0056b3' },}} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ px: 6, display: 'flex', flexDirection: "column", gap: 5 }}>
              <Typography variant="h2" >{item.name}</Typography>
             
              <Typography variant="h4"  sx={{ marginBottom: 2 }}>${item.price}</Typography>
               <Typography variant="overline"sx={{marginLeft:"80%"}}>{item.username}</Typography>
              

              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" size="large" sx={{ width: '100%', backgroundColor: "black", '&:hover': { backgroundColor: "#85586F" } }}>Add to Cart</Button>
                <Button variant="contained" size="large" sx={{ width: '100%', backgroundColor: "#85586F", '&:hover': { backgroundColor: "black" } }}>Buy Now</Button>
              </Box>

              {/* Size Detail Section */}
              <Button onClick={() => setSize(prev => !prev)} sx={{ color: "black", width: "100%", borderBottom: "1px outset black", borderLeft: "1px outset black" }} endIcon={<KeyboardArrowDown />}>Size Detail</Button>
              {size && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      {item.sizeDetail.map((size, index) => (
                        <TableRow key={index}>
                          <TableCell>{size.label}</TableCell>
                          <TableCell>{size.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Button onClick={() => setShipping(prev => !prev)} sx={{ color: "black", width: "100%", borderBottom: "1px outset black", borderLeft: "1px outset black" }} endIcon={<KeyboardArrowDown />}>Shipping and return</Button>
              {shipping && <Typography>{item.shippingAndReturn}</Typography>}

              <Button onClick={() => setDescription(prev => !prev)} sx={{ color: "black", width: "100%", borderBottom: "1px outset black", borderLeft: "1px outset black" }} endIcon={<KeyboardArrowDown />}>Description</Button>
              {description && <Typography>{item.description}</Typography>}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default ProductPage;
