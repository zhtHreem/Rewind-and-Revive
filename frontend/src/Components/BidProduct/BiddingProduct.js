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
        alert(message); // This shows the backend message in a browser alert
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({
          productId: id,
          bidAmount: Number(bidAmount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the backend error message in alert AND in the form
        setError(data.message || "Failed to place bid");
        alert(data.message || "Failed to place bid");
        return;
      }

      // Clear the field & error after successful bid
      setBidAmount('');
      setError('');
    } catch (error) {
      console.error('Error placing bid:', error);
      setError("Something went wrong. Try again.");
      alert("Something went wrong. Try again.");
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
    const start = new Date(product.bidStartTime);
    const end = new Date(product.bidEndTime);
    const current = new Date();
  
    if (current < start) {
      const diff = start - current;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return `Bidding starts in ${hours}h ${minutes}m ${seconds}s`;
    }
  
    if (current >= start && current <= end) {
      const diff = end - current;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return `${hours}h ${minutes}m ${seconds}s remaining`;
    }
  
    return 'Bidding has ended';
  };
  
  if (loading) {
      return <Typography textAlign="center">Loading...</Typography>;
 }
 
  const selectedOption = product.biddingModel;
  const highestBidderOnly = selectedOption === "Highest Bidder";

    const displayedBidders = highestBidderOnly
  ? bidders.length > 0 ? [bidders[0]] : [] // Show only the highest bidder
  : bidders.slice(0, 3); // Show top 3 bidders

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
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400,
      bgcolor: "background.paper",
      borderRadius: 1,
      boxShadow: 24,
      p: 4,
    }}
  >
    <Typography variant="h6" component="h2">
      {highestBidderOnly ? "Highest Bidder" : "Top 3 Bidders"}
    </Typography>

    <Box sx={{ mt: 2 }}>
      {displayedBidders.length > 0 ? (
        displayedBidders.map((bid, index) => (
          <Paper key={index} sx={{ padding: 1, marginBottom: 1 }}>
            <Typography>
              <strong>{bid.name}</strong>: Rs.{bid.bidAmount}
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
                 onChange={(e) => {
                  setBidAmount(e.target.value);
                  setError(''); // Clear error while typing
                }}
                disabled={!isBiddingOpen || isBiddingClosed}
                error={!!error}
                helperText={error}
               />
                 <Button
                  variant="contained"
                  size="medium"
                  sx={{ backgroundColor: '#85586F', '&:hover': { backgroundColor: 'black' } }}
                  onClick={handlePlaceBid}
                 disabled={!isBiddingOpen || isBiddingClosed}
                  >
                   Place Your Bid
                </Button>

            </Box>
            <Box sx={{ padding: 2, border: '1px solid #ccc', marginTop: 2, textAlign: 'center' }}>
            <Typography variant="h6">Starting Price: Rs.{product.startingPrice}</Typography>
            <Typography variant="h6">
              Bidding Starts at: {new Date(product.bidStartTime).toLocaleString("en-US", {
              timeZone: "Asia/Karachi", // Replace with your time zone
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              })}
           </Typography>
           <Typography variant="h6">
             Bidding Ends at: {new Date(product.bidEndTime).toLocaleString("en-US", {
             timeZone: "Asia/Karachi", // Replace with your time zone
             year: "numeric",
             month: "2-digit",
             day: "2-digit",
             hour: "2-digit",
             minute: "2-digit",
             second: "2-digit",
             })}
           </Typography>
                {!isBiddingOpen && !isBiddingClosed && (
                   <Typography variant="h6" color="warning">
                    Bidding has not started yet
                  </Typography>
                )}
              {isBiddingOpen && <Typography>{timeRemaining()}</Typography>}
              {isBiddingClosed && (
                 <Typography variant="h6" color="error" sx={{ marginTop: 2 }}>
                      Bidding has closed
                    </Typography>
                 )}
              </Box>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default BiddingProduct;
