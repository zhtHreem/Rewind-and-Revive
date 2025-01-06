import { Grid, Box, Typography, Button } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Layout from '../Layout/layout';
import ProductChat from '../ProductChat/ProductChat';
import { Swiper, SwiperSlide } from 'swiper/react';
import '..swiper/css';
import '..swiper/css/pagination';
import { Pagination } from 'swiper';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductPage = () => {
  const [cart, setCart] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [slidesPerView, setSlidesPerView] = useState(4);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [description, setDescription] = useState(false);
  const productId = "67720e9813993fae4cbcfadd";
  const navigate = useNavigate();

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
  }, [productId]);

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
  ] : [];

  return (
    <Layout>
      <Swiper slidesPerView={slidesPerView} spaceBetween={10} pagination={{ clickable: true }} modules={[Pagination]} style={{ marginTop: '20px' }}>
        {product.images.map((image, index) => (
          <SwiperSlide key={index} onClick={() => handleImageClick(image)}>
            <Box component="img" src={image} alt={`Thumbnail ${index + 1}`} sx={{ cursor: 'pointer' }} />
          </SwiperSlide>
        ))}
      </Swiper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ px: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Typography variant="h2">{product.name}</Typography>
            <Typography variant="h4">${product.price}</Typography>
            <Button variant="contained" onClick={handleAddToCart}>Add to Cart</Button>

            <Button onClick={() => setSize(!size)} endIcon={<KeyboardArrowDown />}>Size Details</Button>
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

            <Button onClick={() => setDescription(!description)} endIcon={<KeyboardArrowDown />}>Description</Button>
            {description && <Typography>{product.description}</Typography>}
          </Box>
        </Grid>
      </Grid>

      <div
        style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#007bff', color: 'white', padding: '10px 15px', borderRadius: '30px', cursor: 'pointer' }}
        onClick={() => setIsChatOpen(!isChatOpen)}>
        💬 Chat
      </div>
      {isChatOpen && <ProductChat productId={productId} ownerId={product.owner?._id} />}
    </Layout>
  );
};

export default ProductPage;