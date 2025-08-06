import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Layout from '../Layout/layout';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Alert from '@mui/material/Alert';
const BiddingProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidders, setBidders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isBiddingOpen, setIsBiddingOpen] = useState(false);
  const [isBiddingClosed, setIsBiddingClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/${id}`);
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    const fetchBidders = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/bid/${id}`);
        const data = await response.json();
        setBidders(data);
      } catch (error) {
        const message = error.response?.data?.message || "An error occurred";
        alert(message);
      }
    };

    fetchProduct();
    fetchBidders();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (product) {
      const current = new Date();
      const start = new Date(product.bidStartTime);
      const end = new Date(product.bidEndTime);
      setIsBiddingOpen(current >= start && current <= end);
      setIsBiddingClosed(current > end);
    }
  }, [currentTime, product]);

  const handleOpenModal = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/bid/${id}`);
      const data = await response.json();
      setBidders(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching bidders:", error);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handlePlaceBid = async () => {
    if (bidAmount) {
      if (Number(bidAmount) <= product.startingPrice) {
        setError(`Bid amount must be greater than Rs.${product.startingPrice}`);
        return;
      }
      try {
        const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/bid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: localStorage.getItem('token') },
          body: JSON.stringify({ productId: id, bidAmount: Number(bidAmount) }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || "Failed to place bid");
          alert(data.message || "Failed to place bid");
          return;
        }
        setBidAmount('');
        setError('');
      } catch (error) {
        console.error('Error placing bid:', error);
        setError("Something went wrong. Try again.");
        alert("Something went wrong. Try again.");
      }
    }
  };

  const timeRemaining = () => {
    const start = new Date(product.bidStartTime);
    const end = new Date(product.bidEndTime);
    const current = new Date();
    if (current < start) {
      const diff = start - current;
      return `Bidding starts in ${Math.floor(diff / (1000 * 60 * 60))}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m ${Math.floor((diff % (1000 * 60)) / 1000)}s`;
    }
    if (current >= start && current <= end) {
      const diff = end - current;
      return `${Math.floor(diff / (1000 * 60 * 60))}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m ${Math.floor((diff % (1000 * 60)) / 1000)}s remaining`;
    }
    return 'Bidding has ended';
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><Typography variant="h6">Loading...</Typography></Box></Layout>;
  if (!product) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><Typography variant="h6">Loading product details...</Typography></Box></Layout>;

  const selectedOption = product.biddingModel;
  const highestBidderOnly = selectedOption === "Highest Bidder";
  const displayedBidders = highestBidderOnly ? (bidders.length > 0 ? [bidders[0]] : []) : bidders.slice(0, 3);

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <Box sx={{position: 'fixed',top: 60,right: 16,zIndex: 9999,display: 'flex',alignItems: 'center',bgcolor: '#e3f2fd',color: '#1976d2',px: 2,py: 1,borderRadius: 2,fontWeight: 500, maxWidth: '250px',boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    animation: 'fadeSlide 3s ease-in-out infinite',
    '@keyframes fadeSlide': {
      '0%': { opacity: 0, transform: 'translateX(50px)' },
      '20%': { opacity: 1, transform: 'translateX(0)' },
      '80%': { opacity: 1, transform: 'translateX(0)' },
      '100%': { opacity: 0, transform: 'translateX(50px)' }
    } }}>
      <InfoOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />
            See the details below
      </Box>



        <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} lg={7}>
              <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative' }}>
                <Box sx={{ position: 'relative', height: { xs: 400, md: 500, lg: 600 }, overflow: 'hidden' }}>
                  <Box component="img" src={product.images} alt="Product Image" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isBiddingOpen && <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#d32f2f', color: 'white', px: 2, py: 0.5, borderRadius: 1, fontSize: '0.875rem', fontWeight: 600 }}>LIVE</Box>}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>{product.name}</Typography>
                  <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 3 }}>{product.description}</Typography>
                  <Button variant="outlined" size="large" onClick={handleOpenModal} sx={{ borderColor: '#1976d2', color: '#893F45', borderRadius: 1.5, px: 3, py: 1.5, fontWeight: 600, '&:hover': { bgcolor: '#576F72', color: 'white' } }}>{highestBidderOnly ? 'View Highest Bidder' : 'View Top Bidders'}</Button>
                </Box>

                <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: isBiddingOpen ? '2px solid #4caf50' : 'none' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a1a1a' }}>Place Your Bid</Typography>
                  <TextField label="Bid amount (Rs.)" variant="outlined" fullWidth value={bidAmount} onChange={(e) => { setBidAmount(e.target.value); setError(''); }} disabled={!isBiddingOpen || isBiddingClosed} error={!!error} helperText={error} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
                  <Button variant="contained" size="large" fullWidth onClick={handlePlaceBid} disabled={!isBiddingOpen || isBiddingClosed} sx={{ bgcolor: isBiddingOpen ? '#893F45' : '#bdbdbd', borderRadius: 1.5, py: 1.5, fontWeight: 600, fontSize: '1rem', '&:hover': { bgcolor: isBiddingOpen ? '#893F45' : '#bdbdbd' }, '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' } }}>{isBiddingOpen ? 'Place Bid' : isBiddingClosed ? 'Auction Ended' : 'Auction Pending'}</Button>
                </Box>

                <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a1a1a' }}>Auction Details</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box><Typography variant="body2" color="text.secondary">Starting Price</Typography><Typography variant="h6" sx={{ fontWeight: 600 }}>Rs.{product.startingPrice?.toLocaleString()}</Typography></Box>
                    <Box><Typography variant="body2" color="text.secondary">Bidding Start Time</Typography><Typography variant="body1">{new Date(product.bidStartTime).toLocaleString("en-US", { timeZone: "Asia/Karachi", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Typography></Box>
                    <Box><Typography variant="body2" color="text.secondary">Bidding End Time</Typography><Typography variant="body1">{new Date(product.bidEndTime).toLocaleString("en-US", { timeZone: "Asia/Karachi", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Typography></Box>
                    <Box sx={{ bgcolor: isBiddingOpen ? '#e8f5e8' : isBiddingClosed ? '#ffebee' : '#fff3e0', borderRadius: 1, p: 2, mt: 1 }}><Typography variant="h6" sx={{ fontWeight: 600, color: isBiddingOpen ? '#2e7d32' : isBiddingClosed ? '#c62828' : '#ef6c00', textAlign: 'center' }}>{!isBiddingOpen && !isBiddingClosed && 'Bidding Not Started'}{isBiddingOpen && timeRemaining()}{isBiddingClosed && 'Bidding Has Ended'}</Typography></Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Modal open={isModalOpen} onClose={handleCloseModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90vw', sm: 500 }, maxHeight: '80vh', overflow: 'auto', bgcolor: 'white', borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', p: 0 }}>
            <Box sx={{ bgcolor: '#733635', color: 'white', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{highestBidderOnly ? 'Highest Bidder' : 'Top 3 Bidders'}</Typography>
              <Button onClick={handleCloseModal} sx={{ minWidth: 'auto', color: 'white', p: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>✕</Button>
            </Box>

            <Box sx={{ p: 3 }}>
              {displayedBidders.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {displayedBidders.map((bid, index) => (
                    <Paper key={index} sx={{ p: 2, borderRadius: 1.5, bgcolor: index === 0 ? '#f8f9fa' : 'white', border: index === 0 ? '2px solid #ffc107' : '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: index === 0 ? '#ffc107' : '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>{bid.name?.charAt(0) || 'U'}</Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{bid.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{index === 0 ? 'Highest bid' : `Rank #${index + 1}`}</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>Rs.{bid.bidAmount?.toLocaleString()}</Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: '#666' }}>No bids yet</Typography>
                  <Typography variant="body2" color="text.secondary">Be the first to place a bid</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Modal>
      </Box>
    </Layout>
  );
};

export default BiddingProduct;
