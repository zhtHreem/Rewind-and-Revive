import React, { useState, useEffect } from 'react';
import { useNavigate ,useParams} from 'react-router-dom';

import { Grid, Box, Typography, Button, Stack } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper,  Modal } from '@mui/material';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { ArrowForward } from "@mui/icons-material";

import { Dialog, DialogTitle, DialogContent, DialogActions, Rating, TextField, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

import AddCart from "../ShoppingCart/AddCart";
import Layout from '../Layout/layout';
import ProductChat from '../ProductChat/ProductChat'; // Chat component import
import SkeletonLoader from '../Utils/skeletonLoader';
// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import axios from 'axios';
import MatchOutfitModal from './matchMyOutfit';
  // Create skeleton components for different sections
const ProductImageSkeleton = () => (
  <Box>
    {/* Main image skeleton */}
    <Box sx={{ width: '100%', height: { xs: 300, md: 600, lg: 500 }, border: '1px solid #ccc', padding: 2 }}>
      <SkeletonLoader height="100%" />
    </Box>
    
    {/* Thumbnail images skeleton */}
    <Box sx={{ marginTop: '20px', height: 100 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {Array(4).fill(0).map((_, i) => (
          <SkeletonLoader key={i} width="100px" height="100px" />
        ))}
      </Box>
    </Box>
  </Box>
);

const ProductDetailsSkeleton = () => (
  <Box sx={{ px: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
    {/* Title */}
    <SkeletonLoader.Text lines={1} width="80%" />
    
    {/* Price */}
    <SkeletonLoader.Text lines={1} width="30%" />
    
    {/* Username */}
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <SkeletonLoader width="20%" height="20px" />
    </Box>
    
    {/* Buttons */}
    <Box sx={{ display: 'flex', gap: 2 }}>
      <SkeletonLoader height="48px" width="100%" />
      <SkeletonLoader height="48px" width="100%" />
    </Box>
    
    {/* Accordion buttons */}
    {Array(3).fill(0).map((_, i) => (
      <SkeletonLoader key={i} height="48px" width="100%" />
    ))}
  </Box>
);
const ProductPage = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [description, setDescription] = useState(false);
  const [size, setSize] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [mainImage, setMainImage] = useState('');
  const [slidesPerView, setSlidesPerView] = useState(4);
  const [shoppingCart, setShoppingCart] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // State for chat visibility
  
  const { productId }= useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);

  const resetReviewForm = () => {
    setRating(0);
    setComment('');
    setImage(null);
  };

  // Handlers for modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenReviewDialog = () => setOpenReviewDialog(true);
  const handleCloseReviewDialog = () => {
    resetReviewForm();
    setOpenReviewDialog(false);
  };
  useEffect(() => {

    const fetchProduct = async () => {
      try {

        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/${productId}`);
        setProduct(response.data);
  
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

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);
  
  const handleAddToCart = async (product) => {
    try {
      // Fetch product data from API using the correct product ID
      const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/${productId}`);
      const productData = response.data;
      
      // Update the cart state
      setCart((prevCart) => {

        // Check if the product already exists in the cart by comparing product.id
        const isProductInCart = prevCart.find((item) => item.id === productId);
        if (isProductInCart) {
          console.log('Product already in cart:', productData);
          return prevCart; // Avoid adding duplicates
        }
        
        // Add product to cart with initial quantity
        const updatedCart = [...prevCart, { id: productId, name: productData.name, price: productData.price, quantity: 1 }];
        
        // Log cart after update
        console.log('Cart updated:', updatedCart);
        
        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        
        return updatedCart;
      });

      // Navigate to the cart page (optional)
      setShoppingCart(true);
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  
  const handleCartOpenClose = () => {
    setShoppingCart((prev) => !prev);
  };
  
  const handleImageClick = (image) => {
    setMainImage(image);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();  // Prevent page reload
      
    if (!rating) {
      alert("Please select a rating before submitting.");
      return;
   }
          
   const reviewData = {
    userId: product.owner._id,  // Replace with actual user ID (e.g., from state or context)
    rating: rating
  };

 try {
    const response = await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/user/submit-review`, reviewData, {
        headers: {
            "Content-Type": "application/json",
        }
    });

    console.log("Review submitted successfully:", response.data);
} catch (error) {
    console.error("Error submitting review:", error);
}


    resetReviewForm();
    setOpenReviewDialog(false);
};


  if (!product) {
    return (
      <Layout>
        <Box sx={{ flexGrow: 1, padding: 6 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ProductImageSkeleton />
            </Grid>
            <Grid item xs={12} md={6}>
              <ProductDetailsSkeleton />
            </Grid>
          </Grid>
        </Box>
      </Layout>
    );
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
            <Box sx={{ px: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4">{product.name}</Typography>
                  <Button variant="outlined" endIcon={<ArrowForward />}  onClick={handleOpenModal}  sx={{minWidth:"40%", background: "transparent", color: "#9c27b0", border: "2px solid #c59bff", borderRadius: "20px", padding: "8px 20px", textTransform: "none", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease", "&:hover": { background: "linear-gradient(90deg, #c59bff, #9c27b0)", color: "#fff" } }}>Match My Outfit</Button>
              </Stack>
               <MatchOutfitModal  open={isModalOpen} onClose={handleCloseModal} product={product} /> 
              <Typography variant="h5" sx={{ marginBottom: 2 }}>Rs. {product.price}</Typography>
              
              <Typography variant="overline" sx={{ marginLeft: '80%', cursor: 'pointer', '&:hover': { textDecoration: 'underline', color: 'primary.main' } }} onClick={() => navigate(`/profile/${product.owner._id}`)}>
                {product.owner.username}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleAddToCart}
                  size="large"
                  sx={{ width: '100%', backgroundColor:'black' , '&:hover': { backgroundColor:  '#85586F' } }}
                >
                  Add to Cart
                </Button>
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

              <Button onClick={handleOpenReviewDialog} sx={{ color: 'black', width: '100%', borderBottom: '1px outset black', borderLeft: '1px outset black' }}>
                Leave a Review
             </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

 {/* Rating & Review Dialog */}
 <Dialog open={openReviewDialog} onClose={handleCloseReviewDialog} fullWidth>
  <DialogTitle>Rate & Review</DialogTitle>
   <DialogContent>
     {/* Star Rating */}
     <Rating
       value={rating}
       onChange={(event, newValue) => setRating(newValue)}
       size="large"
     />

     {/* Comment Box */}
     <TextField label="Leave a comment" multiline rows={3} fullWidth margin="dense" value={comment} onChange={(e) => setComment(e.target.value)} />

     {/* Image Upload */}
     <input
       accept="image/*"
       type="file"
       id="upload-image"
       style={{ display: 'none' }}
       onChange={handleImageUpload}
     />
     <label htmlFor="upload-image">
       <IconButton color="primary" component="span">
         <PhotoCamera />
       </IconButton>
       {image && <Typography variant="caption">{image.name}</Typography>}
     </label>
   </DialogContent>

    {/* Submit & Cancel Buttons */}
    <DialogActions>
      <Button onClick={handleCloseReviewDialog} color="error">Cancel</Button>
      <Button onClick={handleSubmitReview} variant="contained" color="primary">Submit</Button>
    </DialogActions>
  </Dialog>

      {/* Floating Chat Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          zIndex: 1000,  }}  onClick={() => setIsChatOpen((prev) => !prev)}>
        💬 Chat
      </div>

      {/* Chatbox Visibility */}
      {isChatOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '350px',
            height: '500px',
            backgroundColor: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            borderRadius: '10px',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <ProductChat productId={productId} ownerId={product.owner._id} />
        </div>
      )}
       <Modal open={shoppingCart} onClose={handleCartOpenClose}>
          <AddCart />
      </Modal>
    </Layout>
  );
};

export default ProductPage;