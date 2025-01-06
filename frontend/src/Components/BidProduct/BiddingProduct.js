import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
//import io from 'socket.io-client';
import { Grid, Box, Typography, Button, Modal, TextField, Paper } from '@mui/material';
import Layout from '../Layout/layout';

//const socket = io('http://localhost:5000');

const BiddingProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidders, setBidders] = useState([]);

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

    // Listen for bid updates
    // socket.on(`bidUpdate:${id}`, (newBid) => {
    //   setBidders((prevBids) => [newBid.bid, ...prevBids].sort((a, b) => b.bidAmount - a.bidAmount));
    // });

    // return () => {
    //   socket.off('newBid');
    // };
  }, [id]);

  const handleOpenModal = async () => {
    try {
      // Fetch latest bidders when the modal is opened
      const response = await fetch(`http://localhost:5000/api/bid/${id}`);
      const data = await response.json();
      setBidders(data); // Update bidders with fetched data
      setIsModalOpen(true); // Open the modal
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
            name: 'You', // Replace with actual user name if available
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

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, padding: 6 }}>
        <Grid container spacing={10}>
          {/* Left: Image */}
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

          {/* Right: Title and Description */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h2">{product.name}</Typography>
              <Typography variant="body1">{product.description}</Typography>

              {/* Top Bidders Button */}
              <Button
                variant="contained"
                size="medium"
                sx={{ backgroundColor: '#85586F', '&:hover': { backgroundColor: 'black' } }}
                onClick={handleOpenModal}
              >
                View Top Bidders
              </Button>

              {/* Modal: List of Bidders */}
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

              {/* Input for placing a bid */}
              <TextField
                label="Place your bid"
                variant="outlined"
                fullWidth
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <Button
                variant="contained"
                size="medium"
                sx={{ backgroundColor: '#85586F', '&:hover': { backgroundColor: 'black' } }}
                onClick={handlePlaceBid}
              >
                Place Your Bid
              </Button>
            </Box>
            <Box sx={{ padding: 2, border: '1px solid #ccc', marginTop: 2, textAlign: 'center' }}>
              <Typography variant="h6">Starting Price: ${product.startingPrice}</Typography>
              <Typography variant="h6">Bidding Starts at: {product.bidStartTime}</Typography>
              <Typography variant="h6">Bidding Ends at: {product.bidEndTime}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default BiddingProduct;
