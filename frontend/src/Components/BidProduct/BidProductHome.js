import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout/layout';
import SkeletonLoader from '../Utils/skeletonLoader';

// ----- design tokens -----
const COLORS = {
  bg: '#FAFAF7',
  surface: '#FFFFFF',
  border: '#ECEAE4',
  accent: '#85586F',
  accentDark: '#6B4459',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  live: '#E53935',
};

// ----- countdown hook -----
const useCountdown = (endTime) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const end = endTime ? new Date(endTime).getTime() : 0;
  const diff = Math.max(0, end - now);
  if (diff === 0) return { ended: true, label: 'Ended' };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  let label;
  if (days > 0) label = `${days}d ${hours}h left`;
  else if (hours > 0) label = `${hours}h ${mins}m left`;
  else label = `${mins}m ${secs}s left`;
  return { ended: false, label, urgent: diff < 3600000 };
};

// ----- skeleton -----
const ProductCardSkeleton = () => (
  <Card
    sx={{
      borderRadius: 3,
      border: `1px solid ${COLORS.border}`,
      boxShadow: 'none',
    }}
  >
    <SkeletonLoader height="220px" />
    <CardContent sx={{ p: 2.5 }}>
      <SkeletonLoader.Text lines={1} width="70%" />
      <Box sx={{ mt: 1.5 }}>
        <SkeletonLoader.Text lines={1} width="40%" />
      </Box>
    </CardContent>
  </Card>
);

// ----- card -----
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const countdown = useCountdown(product.bidEndTime);

  return (
    <Card
      onClick={() => navigate(`/biddingProduct/${product._id}`)}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        border: `1px solid ${COLORS.border}`,
        cursor: 'pointer',
        backgroundColor: COLORS.surface,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 14px 28px rgba(0,0,0,0.08)',
        },
        '&:hover .bid-btn': {
          backgroundColor: COLORS.accent,
          color: '#fff',
        },
        '&:hover img': {
          transform: 'scale(1.04)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          overflow: 'hidden',
          backgroundColor: '#f4f1ec',
        }}
      >
        <CardMedia
          component="img"
          image={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
        />

        {!countdown.ended && (
          <Chip
            label="LIVE"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: '#fff',
              color: COLORS.textPrimary,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: 0.8,
              height: 22,
              '& .MuiChip-label': {
                px: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              },
              '&::before': {
                content: '"●"',
                color: COLORS.live,
                fontSize: 10,
                marginLeft: '8px',
                marginRight: '-4px',
              },
            }}
          />
        )}

        <Chip
          icon={<AccessTimeIcon sx={{ fontSize: 12, color: '#fff !important' }} />}
          label={countdown.label}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: countdown.ended
              ? 'rgba(0,0,0,0.55)'
              : countdown.urgent
              ? COLORS.live
              : 'rgba(0,0,0,0.72)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 11,
            height: 22,
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: 16,
            color: COLORS.textPrimary,
            mb: 0.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {product.name}
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            color: COLORS.textSecondary,
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            minHeight: 19,
          }}
        >
          {product.description || '\u00A0'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 10,
                color: COLORS.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Starting bid
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 20,
                color: COLORS.accent,
                lineHeight: 1.2,
              }}
            >
              Rs. {Number(product.startingPrice || 0).toLocaleString()}
            </Typography>
          </Box>
          <Button
            className="bid-btn"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/biddingProduct/${product._id}`);
            }}
            sx={{
              borderColor: COLORS.accent,
              color: COLORS.accent,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              py: 0.6,
              minWidth: 0,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: COLORS.accentDark,
                borderColor: COLORS.accentDark,
                color: '#fff',
              },
            }}
          >
            Bid now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// ----- empty state -----
const EmptyState = ({ query }) => (
  <Box
    sx={{
      width: '100%',
      textAlign: 'center',
      py: 10,
      color: COLORS.textSecondary,
    }}
  >
    <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 1 }}>
      No auctions found
    </Typography>
    <Typography variant="body2">
      {query
        ? `Nothing matches "${query}". Try a different search.`
        : 'Check back soon — new pieces are listed every day.'}
    </Typography>
  </Box>
);

// ----- page -----
const BidProductHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('ending');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/get`
        );
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    switch (sort) {
      case 'newest':
        sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case 'priceLow':
        sorted.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
        break;
      case 'priceHigh':
        sorted.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
        break;
      case 'ending':
      default:
        sorted.sort(
          (a, b) => new Date(a.bidEndTime) - new Date(b.bidEndTime)
        );
        break;
    }
    return sorted;
  }, [products, query, sort]);

  return (
    <Layout>
      <Box
        sx={{
          backgroundColor: COLORS.bg,
          minHeight: '100vh',
          py: { xs: 4, md: 6 },
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          {/* HERO */}
          <Box sx={{ mb: 5 }}>
            <Typography
              sx={{
                fontSize: 12,
                color: COLORS.textSecondary,
                letterSpacing: 2,
                textTransform: 'uppercase',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Auctions
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 32, md: 44 },
                fontWeight: 700,
                color: COLORS.textPrimary,
                lineHeight: 1.1,
                mb: 1.5,
                fontFamily: '"Playfair Display", "Fraunces", Georgia, serif',
              }}
            >
              Live Bidding
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                color: COLORS.textSecondary,
                maxWidth: 560,
              }}
            >
              Discover one-of-a-kind pre-loved pieces. Place your bid before the
              timer runs out.
            </Typography>
          </Box>

          {/* TOOLBAR */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                color: COLORS.textSecondary,
                fontWeight: 500,
              }}
            >
              {loading
                ? 'Loading auctions…'
                : `${visibleProducts.length} active ${
                    visibleProducts.length === 1 ? 'auction' : 'auctions'
                  }`}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search auctions"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ fontSize: 18, color: COLORS.textSecondary }}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    fontSize: 14,
                    '& fieldset': { borderColor: COLORS.border },
                    '&:hover fieldset': { borderColor: COLORS.accent },
                  },
                }}
                sx={{ width: { xs: '100%', sm: 240 } }}
              />
              <TextField
                select
                size="small"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 170 },
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  '& fieldset': { borderColor: COLORS.border },
                  '& .MuiSelect-select': { fontSize: 14 },
                }}
              >
                <MenuItem value="ending">Ending soon</MenuItem>
                <MenuItem value="newest">Newly listed</MenuItem>
                <MenuItem value="priceLow">Price: low to high</MenuItem>
                <MenuItem value="priceHigh">Price: high to low</MenuItem>
              </TextField>
            </Box>
          </Box>

          {/* GRID */}
          <Grid container spacing={3}>
            {loading ? (
              Array.from(new Array(8)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <ProductCardSkeleton />
                </Grid>
              ))
            ) : visibleProducts.length === 0 ? (
              <Grid item xs={12}>
                <EmptyState query={query} />
              </Grid>
            ) : (
              visibleProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Box>
    </Layout>
  );
};

export default BidProductHome;
