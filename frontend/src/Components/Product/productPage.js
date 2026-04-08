import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Avatar,
  LinearProgress,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import IosShareIcon from '@mui/icons-material/IosShare';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

import AddCart from '../ShoppingCart/AddCart';
import Layout from '../Layout/layout';
import ProductChat from '../ProductChat/ProductChat';
import SkeletonLoader from '../Utils/skeletonLoader';
import axios from 'axios';
import MatchOutfitModal from './matchMyOutfit';

// shared design tokens
const COLORS = {
  bg: '#FAFAF7',
  surface: '#FFFFFF',
  border: '#ECEAE4',
  accent: '#85586F',
  accentDark: '#6B4459',
  accentSoft: '#F5EEF1',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  star: '#F5A623',
  danger: '#E53935',
};
const SERIF = '"Playfair Display", "Fraunces", Georgia, serif';

const formatPKR = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

// ----- skeleton -----
const ProductImageSkeleton = () => (
  <Box sx={{ display: 'flex', gap: 2 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {Array(5).fill(0).map((_, i) => (
        <SkeletonLoader key={i} width="64px" height="64px" />
      ))}
    </Box>
    <Box sx={{ flex: 1, aspectRatio: '1 / 1', borderRadius: 3, overflow: 'hidden' }}>
      <SkeletonLoader height="100%" />
    </Box>
  </Box>
);

const ProductDetailsSkeleton = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <SkeletonLoader.Text lines={1} width="60%" />
    <SkeletonLoader.Text lines={1} width="40%" />
    <SkeletonLoader height="56px" width="100%" />
    {Array(3).fill(0).map((_, i) => (
      <SkeletonLoader key={i} height="48px" width="100%" />
    ))}
  </Box>
);

// ----- mini product card for the bottom strips -----
const MiniProductCard = ({ product, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      borderRadius: 3,
      overflow: 'hidden',
      bgcolor: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      transition: 'all 0.25s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
      },
      '&:hover img': { transform: 'scale(1.04)' },
    }}
  >
    <Box sx={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden', bgcolor: '#f4f1ec' }}>
      <Box
        component="img"
        src={product.images?.[0] || '/placeholder.jpg'}
        alt={product.name}
        sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
      />
    </Box>
    <Box sx={{ p: 1.75 }}>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: 14,
          color: COLORS.textPrimary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          mb: 0.5,
        }}
      >
        {product.name}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: COLORS.accent }}>
        {formatPKR(product.price)}
      </Typography>
    </Box>
  </Box>
);

// ----- horizontal section heading -----
const SectionHeading = ({ eyebrow, title, action }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 3 }}>
    <Box>
      {eyebrow && (
        <Typography
          sx={{
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            fontWeight: 600,
            color: COLORS.textSecondary,
            mb: 0.75,
          }}
        >
          {eyebrow}
        </Typography>
      )}
      <Typography
        sx={{
          fontFamily: SERIF,
          fontSize: { xs: 22, md: 28 },
          fontWeight: 700,
          color: COLORS.textPrimary,
          lineHeight: 1.1,
        }}
      >
        {title}
      </Typography>
    </Box>
    {action}
  </Box>
);

const ProductPage = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [mainImage, setMainImage] = useState('');
  const [shoppingCart, setShoppingCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const { productId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const [isLoggedIn] = useState(localStorage.getItem('token'));

  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'error' });
  const showSnack = (msg, severity = 'error') => setSnack({ open: true, msg, severity });

  const [moreFromSeller, setMoreFromSeller] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const resetReviewForm = () => {
    setRating(0);
    setComment('');
    setImage(null);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenReviewDialog = () => setOpenReviewDialog(true);
  const handleCloseReviewDialog = () => {
    resetReviewForm();
    setOpenReviewDialog(false);
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const openChat = queryParams.get('openChat') === 'true';
  const buyerId = queryParams.get('buyer');
  const [isChatOpen, setIsChatOpen] = useState(openChat);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/${productId}`);
        setProduct(response.data);
        if (response.data.images?.length > 0) {
          setMainImage(response.data.images[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // Fetch "more from this seller" once product loads
  useEffect(() => {
    if (!product?.owner?._id) return;
    const fetchMoreFromSeller = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/catalogue`);
        const others = (res.data || [])
          .filter((p) => p._id !== product._id && p.owner?._id === product.owner._id)
          .slice(0, 4);
        setMoreFromSeller(others);
      } catch (e) {
        console.error('Error fetching seller items:', e);
      }
    };
    fetchMoreFromSeller();
  }, [product]);

  // Fetch recommendations
  useEffect(() => {
    if (!productId) return;
    const fetchRecs = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_LOCAL_URL}/api/product/recommendations/${productId}?topK=4`
        );
        const items = res.data?.recommendations || res.data?.products || res.data || [];
        setRecommendations(Array.isArray(items) ? items.slice(0, 4) : []);
      } catch (e) {
        console.error('Error fetching recommendations:', e);
      }
    };
    fetchRecs();
  }, [productId]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  }, []);

  const handleAddToCart = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/${productId}`);
      const productData = response.data;
      setCart((prevCart) => {
        const isProductInCart = prevCart.find((item) => item.id === productId);
        if (isProductInCart) return prevCart;
        const updatedCart = [
          ...prevCart,
          { id: productId, name: productData.name, price: productData.price, quantity: 1 },
        ];
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
      setShoppingCart(true);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      showSnack('Failed to add to cart');
    }
  };

  const handleCartOpenClose = () => setShoppingCart((prev) => !prev);
  const handleImageClick = (img) => setMainImage(img);
  const handleImageUpload = (event) => setImage(event.target.files[0]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        showSnack('Link copied to clipboard', 'success');
      }
    } catch (e) {
      // user cancelled
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!rating) {
      showSnack('Please select a rating before submitting');
      return;
    }
    const reviewData = { userId: product.owner._id, rating };
    try {
      await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/user/submit-review`, reviewData, {
        headers: { 'Content-Type': 'application/json' },
      });
      showSnack('Review submitted', 'success');
    } catch (error) {
      console.error('Error submitting review:', error);
      showSnack('Failed to submit review');
    }
    resetReviewForm();
    setOpenReviewDialog(false);
  };

  if (!product) {
    return (
      <Layout>
        <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg, py: { xs: 4, md: 6 }, px: { xs: 2, sm: 4, md: 6 } }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Grid container spacing={5}>
              <Grid item xs={12} md={7}><ProductImageSkeleton /></Grid>
              <Grid item xs={12} md={5}><ProductDetailsSkeleton /></Grid>
            </Grid>
          </Box>
        </Box>
      </Layout>
    );
  }

  const sizeDetails =
    product.type === 'top/bottom'
      ? [
          { group: 'Top', label: 'Waist', value: `${product.topSizes.waist}"` },
          { group: 'Top', label: 'Arm length', value: `${product.topSizes.armLength}"` },
          { group: 'Top', label: 'Hips', value: `${product.topSizes.hips}"` },
          { group: 'Top', label: 'Shoulder width', value: `${product.topSizes.shoulderWidth}"` },
          { group: 'Top', label: 'Bust / chest', value: `${product.topSizes.bustChest}"` },
          { group: 'Top', label: 'Neck', value: `${product.topSizes.neckCircumference}"` },
          { group: 'Bottom', label: 'Waist', value: `${product.bottomSizes.waist}"` },
          { group: 'Bottom', label: 'Hips', value: `${product.bottomSizes.hips}"` },
          { group: 'Bottom', label: 'Inseam', value: `${product.bottomSizes.inseam}"` },
          { group: 'Bottom', label: 'Thigh / leg', value: `${product.bottomSizes.thighLegOpening}"` },
          { group: 'Bottom', label: 'Rise', value: `${product.bottomSizes.rise}"` },
        ]
      : product.type === 'top'
      ? [
          { label: 'Waist', value: `${product.topSizes.waist}"` },
          { label: 'Arm length', value: `${product.topSizes.armLength}"` },
          { label: 'Hips', value: `${product.topSizes.hips}"` },
          { label: 'Shoulder width', value: `${product.topSizes.shoulderWidth}"` },
          { label: 'Bust / chest', value: `${product.topSizes.bustChest}"` },
          { label: 'Neck', value: `${product.topSizes.neckCircumference}"` },
        ]
      : product.type === 'bottom'
      ? [
          { label: 'Waist', value: `${product.bottomSizes.waist}"` },
          { label: 'Hips', value: `${product.bottomSizes.hips}"` },
          { label: 'Inseam', value: `${product.bottomSizes.inseam}"` },
          { label: 'Thigh / leg', value: `${product.bottomSizes.thighLegOpening}"` },
          { label: 'Rise', value: `${product.bottomSizes.rise}"` },
        ]
      : [];

  // Mock review summary (until backend exposes it)
  const avgRating = product.averageRating ?? 4.6;
  const reviewCount = product.reviewCount ?? 0;
  const ratingDistribution = [
    { star: 5, pct: 72 },
    { star: 4, pct: 18 },
    { star: 3, pct: 6 },
    { star: 2, pct: 3 },
    { star: 1, pct: 1 },
  ];

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg }}>
        {/* ============ TOP SECTION (gallery + sticky panel) ============ */}
        <Box sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 4, md: 6 } }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Grid container spacing={{ xs: 4, md: 6 }}>
              {/* LEFT — vertical thumbnail rail + square hero */}
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 } }}>
                  {/* Vertical thumbnail rail */}
                  {product.images?.length > 1 && (
                    <Box
                      sx={{
                        display: { xs: 'none', sm: 'flex' },
                        flexDirection: 'column',
                        gap: 1.25,
                        flexShrink: 0,
                        maxHeight: { md: 560 },
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': { width: 4 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: COLORS.border, borderRadius: 2 },
                      }}
                    >
                      {product.images.map((img, index) => {
                        const active = mainImage === img;
                        return (
                          <Box
                            key={index}
                            onClick={() => handleImageClick(img)}
                            sx={{
                              width: 68,
                              height: 68,
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: `2px solid ${active ? COLORS.accent : COLORS.border}`,
                              transition: 'all 0.2s',
                              flexShrink: 0,
                              opacity: active ? 1 : 0.75,
                              '&:hover': { borderColor: COLORS.accent, opacity: 1 },
                            }}
                          >
                            <Box
                              component="img"
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {/* Square hero image */}
                  <Box
                    sx={{
                      flex: 1,
                      position: 'relative',
                      aspectRatio: '1 / 1',
                      bgcolor: '#f4f1ec',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <Box
                      component="img"
                      src={mainImage}
                      alt={product.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {product.isSold && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          bgcolor: COLORS.danger,
                          color: '#fff',
                          px: 1.25,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 1,
                        }}
                      >
                        SOLD
                      </Box>
                    )}
                    {/* Floating action icons on the image (top right) */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ position: 'absolute', top: 16, right: 16 }}
                    >
                      <IconButton
                        onClick={() => setWishlisted((w) => !w)}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(8px)',
                          color: wishlisted ? COLORS.danger : COLORS.textPrimary,
                          width: 40,
                          height: 40,
                          '&:hover': { bgcolor: '#fff' },
                        }}
                      >
                        {wishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                      <IconButton
                        onClick={handleShare}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(8px)',
                          color: COLORS.textPrimary,
                          width: 40,
                          height: 40,
                          '&:hover': { bgcolor: '#fff' },
                        }}
                      >
                        <IosShareIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                </Box>

                {/* Mobile horizontal thumb strip */}
                {product.images?.length > 1 && (
                  <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, mt: 2, overflowX: 'auto' }}>
                    {product.images.map((img, i) => (
                      <Box
                        key={i}
                        onClick={() => handleImageClick(img)}
                        sx={{
                          width: 60,
                          height: 60,
                          flexShrink: 0,
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          border: `2px solid ${mainImage === img ? COLORS.accent : COLORS.border}`,
                        }}
                      >
                        <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>

              {/* RIGHT — sticky info panel */}
              <Grid item xs={12} md={5}>
                <Box sx={{ position: { md: 'sticky' }, top: { md: 24 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Seller pill */}
                  <Box
                    onClick={() => navigate(`/profile/${product.owner._id}`)}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      alignSelf: 'flex-start',
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 10,
                      border: `1px solid ${COLORS.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: COLORS.accent, bgcolor: COLORS.accentSoft },
                    }}
                  >
                    <Avatar sx={{ width: 24, height: 24, bgcolor: COLORS.accent, fontSize: 12, fontWeight: 700 }}>
                      {product.owner.username?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>
                      {product.owner.username}
                    </Typography>
                    <VerifiedOutlinedIcon sx={{ fontSize: 14, color: COLORS.accent }} />
                  </Box>

                  {/* Title */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: COLORS.textSecondary,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      {product.category || 'Item'}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: SERIF,
                        fontSize: { xs: 28, md: 38 },
                        fontWeight: 700,
                        color: COLORS.textPrimary,
                        lineHeight: 1.1,
                        mb: 1.5,
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* Rating row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarRoundedIcon
                            key={s}
                            sx={{
                              fontSize: 18,
                              color: s <= Math.round(avgRating) ? COLORS.star : COLORS.border,
                            }}
                          />
                        ))}
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>
                        {avgRating.toFixed(1)}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: COLORS.textSecondary }}>
                        · {reviewCount} reviews
                      </Typography>
                    </Box>
                  </Box>

                  {/* Price */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                    <Typography
                      sx={{
                        fontFamily: SERIF,
                        fontSize: 42,
                        fontWeight: 700,
                        color: COLORS.accent,
                        lineHeight: 1,
                      }}
                    >
                      {formatPKR(product.price)}
                    </Typography>
                    {product.isSold && (
                      <Chip
                        label="SOLD"
                        size="small"
                        sx={{ bgcolor: COLORS.danger, color: '#fff', fontWeight: 700, fontSize: 11, height: 22 }}
                      />
                    )}
                  </Box>

                  {/* Quick chips */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {product.color && (
                      <Chip
                        label={`Color: ${product.color}`}
                        sx={{ bgcolor: COLORS.accentSoft, color: COLORS.accent, fontWeight: 600, fontSize: 12 }}
                      />
                    )}
                    {product.type && (
                      <Chip
                        label={product.type}
                        sx={{
                          bgcolor: COLORS.accentSoft,
                          color: COLORS.accent,
                          fontWeight: 600,
                          fontSize: 12,
                          textTransform: 'capitalize',
                        }}
                      />
                    )}
                  </Box>

                  {/* Primary CTAs */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<ShoppingBagOutlinedIcon />}
                      onClick={handleAddToCart}
                      disabled={product.isSold}
                      sx={{
                        flex: 1,
                        borderColor: COLORS.accent,
                        color: COLORS.accent,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 1.5,
                        '&:hover': { bgcolor: COLORS.accentSoft, borderColor: COLORS.accentDark },
                        '&:disabled': { borderColor: COLORS.border, color: '#bdbdbd' },
                      }}
                    >
                      Add to cart
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/payment')}
                      disabled={product.isSold}
                      sx={{
                        flex: 1,
                        bgcolor: COLORS.accent,
                        color: '#fff',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 1.5,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: COLORS.accentDark, boxShadow: 'none' },
                        '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' },
                      }}
                    >
                      Buy now
                    </Button>
                  </Stack>

                  {/* Match my outfit — secondary CTA */}
                  <Button
                    onClick={handleOpenModal}
                    startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                    endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                    sx={{
                      width: '100%',
                      textTransform: 'none',
                      color: COLORS.accent,
                      fontWeight: 600,
                      borderRadius: 2,
                      py: 1,
                      bgcolor: COLORS.accentSoft,
                      '&:hover': { bgcolor: '#EEDCE4' },
                    }}
                  >
                    Match my outfit with AI
                  </Button>

                  {/* Trust signals row */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 1,
                      mt: 1,
                      pt: 2,
                      borderTop: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: COLORS.accent }} />
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>
                        3–5 day delivery
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReplayOutlinedIcon sx={{ fontSize: 18, color: COLORS.accent }} />
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>
                        7-day returns
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VerifiedOutlinedIcon sx={{ fontSize: 18, color: COLORS.accent }} />
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>
                        Verified seller
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: COLORS.accent }} />
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>
                        Ask the seller
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* ============ BELOW THE FOLD — long-scroll sections ============ */}
        <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: { xs: 4, md: 6 } }}>
          <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
            {/* DESCRIPTION (full prose, not collapsed) */}
            <Box sx={{ mb: { xs: 6, md: 9 } }}>
              <SectionHeading eyebrow="The story" title="About this piece" />
              <Typography
                sx={{
                  fontSize: 17,
                  color: COLORS.textPrimary,
                  lineHeight: 1.8,
                  maxWidth: 720,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {product.description || 'No description provided yet.'}
              </Typography>
            </Box>

            {/* MEASUREMENTS table */}
            {sizeDetails.length > 0 && (
              <Box sx={{ mb: { xs: 6, md: 9 } }}>
                <SectionHeading
                  eyebrow="Fit guide"
                  title="Measurements"
                  action={
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: COLORS.accent,
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      How to measure →
                    </Typography>
                  }
                />
                <Box
                  sx={{
                    bgcolor: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 3,
                    p: { xs: 3, md: 4 },
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    columnGap: 6,
                  }}
                >
                  {sizeDetails.map((d, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1.25,
                        borderBottom: `1px solid ${COLORS.border}`,
                        '&:last-of-type, &:nth-last-of-type(2)': { borderBottom: 'none' },
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: COLORS.textSecondary }}>
                        {d.group ? `${d.group} — ${d.label}` : d.label}
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600 }}>
                        {d.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, mt: 1.5, fontStyle: 'italic' }}>
                  All measurements taken flat, in inches.
                </Typography>
              </Box>
            )}

            {/* SHIPPING & RETURNS */}
            <Box sx={{ mb: { xs: 6, md: 9 } }}>
              <SectionHeading eyebrow="Logistics" title="Shipping & returns" />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ p: 3, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 3 }}>
                  <LocalShippingOutlinedIcon sx={{ fontSize: 24, color: COLORS.accent, mb: 1 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5, color: COLORS.textPrimary }}>
                    Standard delivery
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.6 }}>
                    Ships within 1–2 business days. Delivery typically takes 3–5 business days nationwide.
                  </Typography>
                </Box>
                <Box sx={{ p: 3, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 3 }}>
                  <ReplayOutlinedIcon sx={{ fontSize: 24, color: COLORS.accent, mb: 1 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5, color: COLORS.textPrimary }}>
                    Easy returns
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.6 }}>
                    Returns accepted within 7 days of delivery if the item is unworn and tags intact.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* REVIEWS */}
            <Box sx={{ mb: { xs: 6, md: 9 } }}>
              <SectionHeading
                eyebrow="Social proof"
                title="Reviews"
                action={
                  <Button
                    onClick={handleOpenReviewDialog}
                    sx={{
                      textTransform: 'none',
                      color: COLORS.accent,
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2,
                      '&:hover': { bgcolor: COLORS.accentSoft },
                    }}
                  >
                    Write a review
                  </Button>
                }
              />
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 3,
                    }}
                  >
                    <Typography
                      sx={{ fontFamily: SERIF, fontSize: 56, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1 }}
                    >
                      {avgRating.toFixed(1)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarRoundedIcon
                          key={s}
                          sx={{ fontSize: 22, color: s <= Math.round(avgRating) ? COLORS.star : COLORS.border }}
                        />
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: 13, color: COLORS.textSecondary }}>
                      Based on {reviewCount} reviews
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box
                    sx={{
                      p: 4,
                      bgcolor: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    {ratingDistribution.map((r) => (
                      <Box key={r.star} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: 13, color: COLORS.textSecondary, width: 24 }}>
                          {r.star}★
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={r.pct}
                          sx={{
                            flex: 1,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: COLORS.border,
                            '& .MuiLinearProgress-bar': { bgcolor: COLORS.accent, borderRadius: 4 },
                          }}
                        />
                        <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, width: 32 }}>
                          {r.pct}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* MORE FROM THIS SELLER */}
            {moreFromSeller.length > 0 && (
              <Box sx={{ mb: { xs: 6, md: 9 } }}>
                <SectionHeading
                  eyebrow="From the same closet"
                  title={`More from ${product.owner.username}`}
                  action={
                    <Button
                      onClick={() => navigate(`/profile/${product.owner._id}`)}
                      sx={{
                        textTransform: 'none',
                        color: COLORS.accent,
                        fontWeight: 600,
                        '&:hover': { bgcolor: COLORS.accentSoft },
                      }}
                    >
                      View all →
                    </Button>
                  }
                />
                <Grid container spacing={2.5}>
                  {moreFromSeller.map((p) => (
                    <Grid item xs={6} sm={4} md={3} key={p._id}>
                      <MiniProductCard product={p} onClick={() => navigate(`/product/${p._id}`)} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* YOU MAY ALSO LIKE */}
            {recommendations.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <SectionHeading
                  eyebrow="Curated for you"
                  title="You may also like"
                  action={
                    <Button
                      onClick={() => navigate('/catalogue')}
                      sx={{
                        textTransform: 'none',
                        color: COLORS.accent,
                        fontWeight: 600,
                        '&:hover': { bgcolor: COLORS.accentSoft },
                      }}
                    >
                      Explore shop →
                    </Button>
                  }
                />
                <Grid container spacing={2.5}>
                  {recommendations.map((p) => (
                    <Grid item xs={6} sm={4} md={3} key={p._id}>
                      <MiniProductCard product={p} onClick={() => navigate(`/product/${p._id}`)} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <MatchOutfitModal open={isModalOpen} onClose={handleCloseModal} product={product} />

      {/* Review dialog */}
      <Dialog
        open={openReviewDialog}
        onClose={handleCloseReviewDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${COLORS.border}` } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 700,
            color: COLORS.textPrimary,
            pb: 1,
          }}
        >
          Rate this seller
          <IconButton onClick={handleCloseReviewDialog} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              size="large"
              sx={{ '& .MuiRating-iconFilled': { color: COLORS.accent } }}
            />
          </Box>
          <TextField
            label="Leave a comment"
            multiline
            rows={3}
            fullWidth
            margin="dense"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: COLORS.border },
                '&:hover fieldset': { borderColor: COLORS.accent },
                '&.Mui-focused fieldset': { borderColor: COLORS.accent },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: COLORS.accent },
            }}
          />
          <input accept="image/*" type="file" id="upload-image" style={{ display: 'none' }} onChange={handleImageUpload} />
          <label htmlFor="upload-image">
            <Button
              component="span"
              startIcon={<PhotoCamera />}
              sx={{
                mt: 1,
                textTransform: 'none',
                color: COLORS.accent,
                fontWeight: 600,
                '&:hover': { bgcolor: COLORS.accentSoft },
              }}
            >
              {image ? image.name : 'Add photo'}
            </Button>
          </label>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCloseReviewDialog}
            sx={{
              textTransform: 'none',
              color: COLORS.textSecondary,
              fontWeight: 600,
              '&:hover': { bgcolor: 'transparent', color: COLORS.textPrimary },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            sx={{
              bgcolor: COLORS.accent,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              px: 2.5,
              '&:hover': { bgcolor: COLORS.accentDark, boxShadow: 'none' },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating chat */}
      {isLoggedIn && (
        <>
          <IconButton
            onClick={() => setIsChatOpen((prev) => !prev)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 56,
              height: 56,
              bgcolor: COLORS.accent,
              color: '#fff',
              boxShadow: '0 8px 24px rgba(133,88,111,0.35)',
              zIndex: 1000,
              '&:hover': { bgcolor: COLORS.accentDark },
            }}
          >
            {isChatOpen ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
          </IconButton>
          {isChatOpen && product && product.owner && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 96,
                right: 24,
                width: { xs: 'calc(100vw - 32px)', sm: 380 },
                height: 520,
                bgcolor: COLORS.surface,
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 20px 48px rgba(0,0,0,0.18)',
                overflow: 'hidden',
                zIndex: 1000,
              }}
            >
              <ProductChat productId={productId} ownerId={product.owner._id} buyerId={buyerId} />
            </Box>
          )}
        </>
      )}

      <Modal open={shoppingCart} onClose={handleCartOpenClose}>
        <AddCart />
      </Modal>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default ProductPage;
