import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Modal,
  TextField,
  Paper,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Layout from '../Layout/layout';

// ----- shared design tokens (same as BidProductHome) -----
const COLORS = {
  bg: '#FAFAF7',
  surface: '#FFFFFF',
  border: '#ECEAE4',
  accent: '#85586F',
  accentDark: '#6B4459',
  accentSoft: '#F5EEF1',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  live: '#E53935',
};

const SERIF = '"Playfair Display", "Fraunces", Georgia, serif';

// ----- helpers -----
const formatPKR = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-US', {
    timeZone: 'Asia/Karachi',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ----- countdown -----
const useCountdown = (start, end) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const startMs = start ? new Date(start).getTime() : 0;
  const endMs = end ? new Date(end).getTime() : 0;

  if (now < startMs) {
    const diff = startMs - now;
    return {
      state: 'pending',
      label: `Starts in ${formatDiff(diff)}`,
      urgent: false,
    };
  }
  if (now > endMs) {
    return { state: 'ended', label: 'Auction ended', urgent: false };
  }
  const diff = endMs - now;
  return {
    state: 'live',
    label: `${formatDiff(diff)} left`,
    urgent: diff < 60 * 60 * 1000,
  };
};

const formatDiff = (ms) => {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
};

// ----- gallery -----
const ImageGallery = ({ images, name, isLive }) => {
  const list = useMemo(() => {
    if (!images) return ['/placeholder.jpg'];
    if (Array.isArray(images)) return images.length ? images : ['/placeholder.jpg'];
    return [images];
  }, [images]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [list.length]);

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          bgcolor: '#f4f1ec',
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <Box
          component="img"
          src={list[active]}
          alt={name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {isLive && (
          <Chip
            label="LIVE"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: '#fff',
              color: COLORS.textPrimary,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: 0.8,
              height: 24,
              '&::before': {
                content: '"●"',
                color: COLORS.live,
                marginLeft: '10px',
                marginRight: '-4px',
              },
            }}
          />
        )}
      </Box>

      {list.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
          {list.map((src, i) => (
            <Box
              key={i}
              onClick={() => setActive(i)}
              sx={{
                width: 72,
                height: 72,
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                border: `2px solid ${active === i ? COLORS.accent : COLORS.border}`,
                transition: 'border-color 0.2s',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={src}
                alt={`${name} ${i + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ----- main page -----
const BiddingProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'error' });

  const showSnack = (msg, severity = 'error') =>
    setSnack({ open: true, msg, severity });

  const fetchBidders = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_LOCAL_URL}/api/bid/${id}`
      );
      const data = await res.json();
      if (Array.isArray(data)) setBidders(data);
    } catch (e) {
      console.error('Error fetching bidders:', e);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/${id}`
        );
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        console.error('Error fetching product:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    fetchBidders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const countdown = useCountdown(
    product?.bidStartTime,
    product?.bidEndTime
  );
  const isLive = countdown.state === 'live';
  const isEnded = countdown.state === 'ended';

  const highestBid = bidders.length > 0 ? bidders[0].bidAmount : null;
  const currentBid = highestBid || product?.startingPrice || 0;
  const minNextBid = currentBid + 1;

  const handlePlaceBid = async () => {
    if (!bidAmount) {
      showSnack('Enter a bid amount');
      return;
    }
    if (Number(bidAmount) < minNextBid) {
      showSnack(`Bid must be at least ${formatPKR(minNextBid)}`);
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({ productId: id, bidAmount: Number(bidAmount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        showSnack(data.message || 'Failed to place bid');
        return;
      }
      setBidAmount('');
      showSnack('Bid placed successfully', 'success');
      fetchBidders();
    } catch (e) {
      console.error('Error placing bid:', e);
      showSnack('Something went wrong. Try again.');
    }
  };

  if (loading || !product) {
    return (
      <Layout>
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: COLORS.bg,
          }}
        >
          <Typography sx={{ color: COLORS.textSecondary }}>
            Loading auction…
          </Typography>
        </Box>
      </Layout>
    );
  }

  const highestBidderOnly = product.biddingModel === 'Highest Bidder';
  const displayedBidders = highestBidderOnly
    ? bidders.slice(0, 1)
    : bidders.slice(0, 3);

  return (
    <Layout>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: COLORS.bg,
          py: { xs: 4, md: 6 },
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Grid container spacing={5}>
            {/* LEFT — gallery */}
            <Grid item xs={12} md={7}>
              <ImageGallery
                images={product.images}
                name={product.name}
                isLive={isLive}
              />
            </Grid>

            {/* RIGHT — sticky info panel */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: { md: 'sticky' },
                  top: { md: 24 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                {/* Title block */}
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
                    Auction
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: SERIF,
                      fontSize: { xs: 28, md: 36 },
                      fontWeight: 700,
                      color: COLORS.textPrimary,
                      lineHeight: 1.15,
                      mb: 2,
                    }}
                  >
                    {product.name}
                  </Typography>

                  {/* Status row */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip
                      icon={
                        <AccessTimeIcon
                          sx={{ fontSize: 14, color: '#fff !important' }}
                        />
                      }
                      label={countdown.label}
                      sx={{
                        bgcolor: isEnded
                          ? '#9e9e9e'
                          : countdown.urgent
                          ? COLORS.live
                          : COLORS.textPrimary,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 12,
                        height: 28,
                      }}
                    />
                    <Chip
                      icon={
                        <GavelIcon
                          sx={{ fontSize: 14, color: `${COLORS.accent} !important` }}
                        />
                      }
                      label={`${bidders.length} ${
                        bidders.length === 1 ? 'bid' : 'bids'
                      }`}
                      sx={{
                        bgcolor: COLORS.accentSoft,
                        color: COLORS.accent,
                        fontWeight: 600,
                        fontSize: 12,
                        height: 28,
                      }}
                    />
                  </Box>
                </Box>

                {/* PRICE — the hero */}
                <Box
                  sx={{
                    bgcolor: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 3,
                    p: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: COLORS.textSecondary,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {highestBid ? 'Current bid' : 'Starting bid'}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: SERIF,
                      fontSize: 40,
                      fontWeight: 700,
                      color: COLORS.accent,
                      lineHeight: 1.1,
                      mb: 0.5,
                    }}
                  >
                    {formatPKR(currentBid)}
                  </Typography>
                  {highestBid && (
                    <Typography
                      sx={{ fontSize: 13, color: COLORS.textSecondary, mb: 2 }}
                    >
                      Started at {formatPKR(product.startingPrice)}
                    </Typography>
                  )}

                  {/* Bid input */}
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                    <TextField
                      fullWidth
                      size="medium"
                      placeholder={`Min. ${formatPKR(minNextBid)}`}
                      value={bidAmount}
                      onChange={(e) =>
                        setBidAmount(e.target.value.replace(/[^0-9]/g, ''))
                      }
                      disabled={!isLive}
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          fontSize: 16,
                          '& fieldset': { borderColor: COLORS.border },
                          '&:hover fieldset': { borderColor: COLORS.accent },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handlePlaceBid}
                      disabled={!isLive}
                      sx={{
                        bgcolor: COLORS.accent,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: 15,
                        px: 3,
                        whiteSpace: 'nowrap',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: COLORS.accentDark,
                          boxShadow: 'none',
                        },
                        '&:disabled': {
                          bgcolor: '#e0e0e0',
                          color: '#9e9e9e',
                        },
                      }}
                    >
                      {isEnded
                        ? 'Ended'
                        : isLive
                        ? 'Place bid'
                        : 'Not started'}
                    </Button>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: COLORS.textSecondary,
                      mt: 1.5,
                    }}
                  >
                    Enter {formatPKR(minNextBid)} or more to place a bid.
                  </Typography>
                </Box>

                {/* Description */}
                {product.description && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: COLORS.textSecondary,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      About this item
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 15,
                        color: COLORS.textPrimary,
                        lineHeight: 1.6,
                      }}
                    >
                      {product.description}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ borderColor: COLORS.border }} />

                {/* Auction details */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: COLORS.textSecondary,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      mb: 1.5,
                    }}
                  >
                    Auction details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <DetailRow
                      label="Starts"
                      value={formatDateTime(product.bidStartTime)}
                    />
                    <DetailRow
                      label="Ends"
                      value={formatDateTime(product.bidEndTime)}
                    />
                    <DetailRow
                      label="Format"
                      value={product.biddingModel || 'Standard'}
                    />
                  </Box>
                </Box>

                {/* View bidders link */}
                <Button
                  onClick={() => setIsModalOpen(true)}
                  startIcon={<EmojiEventsIcon />}
                  sx={{
                    alignSelf: 'flex-start',
                    color: COLORS.accent,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 14,
                    px: 0,
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: COLORS.accentDark,
                    },
                  }}
                >
                  {highestBidderOnly
                    ? 'View highest bidder'
                    : 'View top bidders'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* BIDDERS MODAL */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '92vw', sm: 480 },
              maxHeight: '85vh',
              overflow: 'auto',
              bgcolor: COLORS.surface,
              borderRadius: 3,
              boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
              outline: 'none',
            }}
          >
            <Box
              sx={{
                bgcolor: COLORS.accent,
                color: '#fff',
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 22,
                }}
              >
                {highestBidderOnly ? 'Highest bidder' : 'Top bidders'}
              </Typography>
              <IconButton
                onClick={() => setIsModalOpen(false)}
                sx={{
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ p: 3 }}>
              {displayedBidders.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {displayedBidders.map((bid, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor:
                          index === 0 ? COLORS.accentSoft : COLORS.surface,
                        border: `1px solid ${
                          index === 0 ? COLORS.accent : COLORS.border
                        }`,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            bgcolor:
                              index === 0 ? COLORS.accent : COLORS.border,
                            color:
                              index === 0 ? '#fff' : COLORS.textPrimary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 16,
                          }}
                        >
                          {bid.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{ fontWeight: 600, color: COLORS.textPrimary }}
                          >
                            {bid.name}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: COLORS.textSecondary,
                            }}
                          >
                            {index === 0
                              ? 'Highest bid'
                              : `Rank #${index + 1}`}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 18,
                            color: COLORS.accent,
                          }}
                        >
                          {formatPKR(bid.bidAmount)}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                      mb: 0.5,
                    }}
                  >
                    No bids yet
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13, color: COLORS.textSecondary }}
                  >
                    Be the first to place a bid.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Modal>

        {/* SNACKBAR */}
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
      </Box>
    </Layout>
  );
};

const DetailRow = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      py: 0.75,
    }}
  >
    <Typography sx={{ fontSize: 13, color: COLORS.textSecondary }}>
      {label}
    </Typography>
    <Typography
      sx={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 500 }}
    >
      {value}
    </Typography>
  </Box>
);

export default BiddingProduct;
