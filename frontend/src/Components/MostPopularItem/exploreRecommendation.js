import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Container,
  Button,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

import SectionHeader from '../Utils/SectionHeader';

axios.defaults.withCredentials = true;

const TOKENS = {
  border: '#E5E0DA',
  borderHover: '#C9C0B6',
  ink: '#1F1B16',
  inkSoft: '#6B635A',
  bg: '#FFFFFF',
  bgMuted: '#FAF8F5',
};

// ─────────────────────────────────────────────────────────────────────────────
// Card — same visual language as the catalogue & bidding cards.
// Hover swaps to the second image (if available) instead of the old flip.
// ─────────────────────────────────────────────────────────────────────────────
const RecommendedCard = ({ product }) => {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  const second = product.images && product.images[1];
  const display = hover && second ? second : (product.images && product.images[0]);

  const goToProfile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.owner?._id) navigate(`/profile/${product.owner._id}`);
  };

  return (
    <Card
      elevation={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        height: '100%',
        backgroundColor: TOKENS.bg,
        border: `1px solid ${TOKENS.border}`,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: TOKENS.borderHover,
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component={RouterLink}
        to={`/product/${product._id}`}
        sx={{
          display: 'block',
          position: 'relative',
          width: '100%',
          aspectRatio: '4/5',
          backgroundColor: TOKENS.bgMuted,
          overflow: 'hidden',
        }}
      >
        {display && (
          <img
            src={display}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="400"
            height="500"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
      </Box>

      <CardContent
        sx={{
          p: 1.5,
          flexGrow: 1,
          '&:last-child': { pb: 1.5 },
        }}
      >
        <Box
          component={RouterLink}
          to={`/product/${product._id}`}
          sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <Typography
            sx={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: 500,
              fontSize: '1rem',
              color: TOKENS.ink,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.25,
            }}
          >
            {product.name}
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: TOKENS.ink,
              mb: 0.25,
            }}
          >
            Rs. {product.price?.toLocaleString() ?? product.price}
          </Typography>
        </Box>
        {product.owner?.username && (
          <Typography
            variant="caption"
            onClick={goToProfile}
            sx={{
              color: TOKENS.inkSoft,
              cursor: 'pointer',
              '&:hover': { color: TOKENS.ink, textDecoration: 'underline' },
            }}
          >
            @{product.owner.username}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const RecommendedSkeleton = () => (
  <Card
    elevation={0}
    sx={{
      border: `1px solid ${TOKENS.border}`,
      borderRadius: 2,
      overflow: 'hidden',
    }}
  >
    <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '4/5' }} />
    <CardContent sx={{ p: 1.5 }}>
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="40%" height={20} />
      <Skeleton variant="text" width="60%" height={16} />
    </CardContent>
  </Card>
);

const RecommendedProductsSection = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${process.env.REACT_APP_LOCAL_URL}/api/recommendations`,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (cancelled) return;
        if (response.data.success) {
          setRecommendedProducts(response.data.recommendations || []);
        } else {
          throw new Error(response.data.message || 'API returned unsuccessful response');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRecommendations();
    return () => { cancelled = true; };
  }, []);

  // Hide the section entirely on hard error / no data — no point in showing
  // an empty band on the home page. Catalogue is still one click away.
  if (!loading && (error || recommendedProducts.length === 0)) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, backgroundColor: TOKENS.bgMuted, borderRadius: 0 }}>
      <SectionHeader
        title="Recommended For You"
        subtitle="Fresh picks, just for you"
        viewAllTo="/catalogue"
        viewAllLabel="View all"
      />

      <Grid container spacing={2}>
        {(loading ? Array.from({ length: 8 }) : recommendedProducts.slice(0, 8)).map((product, idx) => (
          <Grid item xs={6} sm={4} md={3} lg={3} key={product?._id || idx}>
            {loading
              ? <RecommendedSkeleton />
              : <RecommendedCard product={product} />}
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default RecommendedProductsSection;
