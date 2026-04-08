import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import clothesHanging from './images/clotheshanging.jpg';
import menImage from './images/men.jpg';

const LimitedTimeDeals = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      aria-label="Featured deals"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 4 },
        gap: { xs: 3, md: 5 },
        textAlign: 'center',
      }}
    >
      {/* Left Image */}
      <Box sx={{ position: 'relative', width: { xs: '100%', sm: '60%', md: '250px' }, flexShrink: 0 }}>
        <Box
          component="img"
          src={clothesHanging}
          alt="Curated rack of second-hand clothing"
          loading="lazy"
          decoding="async"
          sx={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '10px',
          }}
        />
      </Box>

      {/* Text Content */}
      <Box sx={{ maxWidth: 600, textAlign: 'center', px: { xs: 0, md: 2 } }}>
        <Typography
          variant="h6"
          component="p"
          sx={{ color: '#666', mb: 1, fontWeight: 400 }}
        >
          All in One Stop
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 'bold',
            color: '#333',
            mb: 2,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            lineHeight: 1.2,
          }}
        >
          Hurry! Limited Products awaited
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#555',
            mb: 3,
            fontSize: { xs: '0.9rem', md: '1rem' },
            lineHeight: 1.6,
          }}
        >
          Grab these price friendly products. Our carefully curated selection is designed
          to elevate your style without breaking the bank.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/catalogue')}
          sx={{
            backgroundColor: '#ff5722',
            color: '#fff',
            px: 3,
            py: 1.25,
            borderRadius: '5px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#e64a19',
              boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)',
            },
          }}
        >
          Buy Now
        </Button>
      </Box>

      {/* Right Image */}
      <Box sx={{ position: 'relative', width: { xs: '100%', sm: '60%', md: '250px' }, flexShrink: 0 }}>
        <Box
          component="img"
          src={menImage}
          alt="Model wearing pre-loved menswear"
          loading="lazy"
          decoding="async"
          sx={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '10px',
          }}
        />
      </Box>
    </Box>
  );
};

export default LimitedTimeDeals;
