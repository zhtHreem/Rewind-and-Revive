import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Box, Typography, Button, Modal, TextField, Paper } from '@mui/material';
import Layout from '../Layout/layout';

const BiddingProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidders, setBidders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isBiddingClosed, setIsBiddingClosed] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/biddingProduct/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    const fetchBidders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bid/${id}`);
        const data = await response.json();
        setBidders(data);
      } catch (error) {
        console.error('Error fetching bidders:', error);
      }
    };

    fetchProduct();
    fetchBidders();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (product) {
      const current = new Date();
      const start = new Date(product.bidStartTime);
      const end = new Date(product.bidEndTime);
      setIsBiddingClosed(current > end);
    }
  }, [currentTime, product]);

  const handleOpenModal = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bid/${id}`);
      const data = await response.json();
      setBidders(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching bidders:', error);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handlePlaceBid = async () => {
    if (bidAmount) {
      try {
        const response = await fetch('http://localhost:5000/api/bid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: id,
            name: 'You',
            bidAmount: Number(bidAmount),
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('Error placing bid:', data.message);
        }
        setBidAmount('');
      } catch (error) {
        console.error('Error placing bid:', error);
      }
    }
  };

  if (!product) {
    return (
      <Layout>
        <Typography>Loading product details...</Typography>
      </Layout>
    );
  }

  const timeRemaining = () => {
    const end = new Date(product.bidEndTime);
    const diff = end - currentTime;
    if (diff <= 0) return 'Bidding has ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s remaining`;
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, padding: 6 }}>
        <Grid container spacing={10}>
          <Grid item xs={12} md={6}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                width: '100%',
                height: { xs: 300, md: 600, lg: 500 },
                border: '1px solid #ccc',
                padding: 1,
                backgroundColor: '#f9f9f9',
              }}
            >
              <Box
                component="img"
                src={product.images}
                alt="Product Image"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h2">{product.name}</Typography>
              <Typography variant="body1">{product.description}</Typography>

              <Button
                variant="contained"
                size="medium"
                sx={{ backgroundColor: '#85586F', '&:hover': { backgroundColor: 'black' } }}
                onClick={handleOpenModal}
              >
                View Top Bidders
              </Button>

              <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 24,
                    p: 4,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    Top Bidders
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {bidders.length > 0 ? (
                      bidders.map((bid, index) => (
                        <Paper key={index} sx={{ padding: 1, marginBottom: 1 }}>
                          <Typography>
                            <strong>{bid.name}</strong>: ${bid.bidAmount}
                          </Typography>
                        </Paper>
                      ))
                    ) : (
                      <Typography>No bids yet!</Typography>
                    )}
                  </Box>
                </Box>
              </Modal>

              <TextField
                label="Place your bid"
                variant="outlined"
                fullWidth
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={isBiddingClosed}
              />
              <Button
                variant="contained"
                size="medium"
                sx={{ backgroundColor: '#85586F', '&:hover': { backgroundColor: 'black' } }}
                onClick={handlePlaceBid}
                disabled={isBiddingClosed}
              >
                Place Your Bid
              </Button>
            </Box>
            <Box sx={{ padding: 2, border: '1px solid #ccc', marginTop: 2, textAlign: 'center' }}>
              <Typography variant="h6">Starting Price: ${product.startingPrice}</Typography>
              <Typography variant="h6">Bidding Starts at: {product.bidStartTime}</Typography>
              <Typography variant="h6">Bidding Ends at: {product.bidEndTime}</Typography>
              {isBiddingClosed && (
                <Typography variant="h6" color="error" sx={{ marginTop: 2 }}>
                  Bidding has closed
                </Typography>
              )}
              {!isBiddingClosed && <Typography>{timeRemaining()}</Typography>}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default BiddingProduct;
