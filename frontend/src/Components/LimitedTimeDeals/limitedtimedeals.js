import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';

const LimitedTimeDeals = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: '20px',
        textAlign: 'center',
      }}
    >
      {/* Left Image */}
      <Box sx={{ position: 'relative', width: { xs: '100%', md: '250px' } ,}}>
        <img
          src={require("./images/clotheshanging.jpg")}
          alt="Person 1"
          style={{ width: '100%', borderRadius: '10px' }}
        />
      </Box>

      {/* Text Content */}
      <Box mx={10} sx={{ maxWidth: '600px', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
          Limited Time Deals
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#333',
            mb: 2,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}
        >
          Hurry! Limited-Time Savings Await
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#555', mb: 3, fontSize: { xs: '0.9rem', md: '1rem' } }}
        >
            Grab these exclusive offers while they last! Our carefully curated selection is designed to elevate your style without breaking the bank.

        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#ff5722',
            '&:hover': { backgroundColor: '#e64a19' },
            padding: '10px 20px',
            borderRadius: '5px',
          }}
        >
          Buy Now
        </Button>
      </Box>

      {/* Right Image */}
      <Box sx={{ position: 'relative', width: { xs: '100%', md: '250px' } }}>
        <img
          src={require("./images/men.jpg")}
          alt="Person 2"
          style={{ width: '100%', borderRadius: '10px' }}
        />
      </Box>
    </Box>
  );
};

export default LimitedTimeDeals;
