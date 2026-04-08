import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Skeleton,
  Container,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';

import SectionHeader from '../Utils/SectionHeader';

// ─────────────────────────────────────────────────────────────────────────────
// Card matching the new catalogue card style so the site feels consistent.
// ─────────────────────────────────────────────────────────────────────────────
const TOKENS = {
  border: '#E5E0DA',
  borderHover: '#C9C0B6',
  ink: '#1F1B16',
  inkSoft: '#6B635A',
  bg: '#FFFFFF',
  bgMuted: '#FAF8F5',
  accent: '#85586F',
  accentDark: '#643F50',
};

const BidCard = ({ product, onPlaceBid }) => {
  const [hover, setHover] = useState(false);
  const second = product.images && product.images[1];
  const display = hover && second ? second : (product.images && product.images[0]);

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
        sx={{
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
        {/* Live auction pill, top-left */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: TOKENS.accent,
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            px: 1,
            py: 0.4,
            borderRadius: 1,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#7CFC00',
              boxShadow: '0 0 6px #7CFC00',
            }}
          />
          Live
        </Box>
      </Box>

      <CardContent
        sx={{
          p: 1.5,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          '&:last-child': { pb: 1.5 },
        }}
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
          }}
        >
          {product.name}
        </Typography>

        <Box>
          <Typography
            variant="caption"
            sx={{
              color: TOKENS.inkSoft,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Current bid
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.05rem',
              color: TOKENS.ink,
              lineHeight: 1.2,
            }}
          >
            Rs. {product.startingPrice?.toLocaleString() ?? product.startingPrice}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<GavelIcon />}
          onClick={() => onPlaceBid(product._id)}
          sx={{
            mt: 'auto',
            backgroundColor: TOKENS.accent,
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { backgroundColor: TOKENS.accentDark },
          }}
        >
          Place bid
        </Button>
      </CardContent>
    </Card>
  );
};

const BidCardSkeleton = () => (
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
      <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="rounded" width="100%" height={32} sx={{ mt: 1 }} />
    </CardContent>
  </Card>
);

const Bidding = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/get`
        );
        if (!cancelled) setProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching bidding products:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handlePlaceBid = (id) => navigate(`/biddingProduct/${id}`);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <SectionHeader
        title="Live Auctions"
        subtitle="Bid, win, and style sustainably"
        viewAllTo="/bidProduct"
        viewAllLabel="See all auctions"
      />

      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <BidCardSkeleton key={i} />
          ))}
        </Box>
      ) : products.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            color: TOKENS.inkSoft,
            border: `1px dashed ${TOKENS.border}`,
            borderRadius: 2,
            backgroundColor: TOKENS.bgMuted,
          }}
        >
          <Typography>No auctions running right now. Check back soon.</Typography>
        </Box>
      ) : (
        <Swiper
          modules={[Navigation, A11y]}
          navigation
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{
            480: { slidesPerView: 2.2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 20 },
            1440: { slidesPerView: 5, spaceBetween: 20 },
          }}
          style={{
            paddingBottom: 8,
            // Push the Swiper navigation arrows just outside the viewport so
            // they don't overlap the cards on small screens.
            '--swiper-navigation-color': TOKENS.ink,
            '--swiper-navigation-size': '20px',
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product._id} style={{ height: 'auto' }}>
              <BidCard product={product} onPlaceBid={handlePlaceBid} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Container>
  );
};

export default Bidding;
