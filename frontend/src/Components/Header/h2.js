import React from 'react';
import { Box, Stack, Typography, Button, Grid,IconButton } from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import AddSharpIcon from '@mui/icons-material/AddSharp';
import { Link } from 'react-router-dom';

function ResponsiveHeader() {
  return (
    <Box
      sx={{
        padding: { xs: '20px', md: '40px' },
        background: 'linear-gradient(45deg, #ff5733, #ffd633)',
        color: '#fff'
      }}
    >
      <Grid container spacing={2}>
        {/* Left section with Text and Button */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Typography 
              variant='h2'
              fontFamily="'Times New Roman', serif"
              fontSize={{ xs: '2rem', md: '3rem' }}
            >
              Rewind and Revive
            </Typography>
            <Typography 
              variant="body2" 
              fontSize={{ xs: '0.75rem', md: '1rem' }} 
              sx={{ color: '#fff', fontFamily: "'Arial', sans-serif" }}
            >
              Discover sustainable fashion at Rewind & Revive, the ultimate online thrift store for unique, second-hand treasures
            </Typography>
            
            <Button
              variant='contained'
              color='error'
              
              sx={{
                backgroundColor: 'orangered',
                color: '#fff',
                '&:hover': { backgroundColor: 'darkred' }
              }}
            >
              Explore More
            </Button>

            <Typography 
              variant="body2" 
              fontSize="1rem" 
              sx={{ color: '#fff', fontFamily: "'Arial', sans-serif" }}
            >
              Quality second-hand fashion
            </Typography>
          </Stack>
        </Grid>

        {/* Right section with Images */}
        <Grid item xs={12} md={6}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: { xs: 'center', md: 'flex-end' } }}
          >
            <Box
              sx={{
                width: { xs: '120px', md: '200px' },
                height: 'auto',
                background: 'linear-gradient(135deg, #ff5733 50%, #ffd633 50%)',
                border: '2px solid #fffefa',
                transform: 'rotate(-5deg)',
                position: 'relative',
                top: '-10px'
              }}
            />
            <Box
              sx={{
                width: { xs: '120px', md: '200px' },
                height: 'auto',
                background: 'linear-gradient(135deg, #ff5733 50%, #ffd633 50%)',
                border: '2px solid #fffefa',
                position: 'relative',
                top: '-20px',
                left: '-20px'
              }}
            />
          </Stack>
        </Grid>
      </Grid>

      {/* Features List */}
      <Box py={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="h5">What Makes Us Stand Out?</Typography>
              <Typography variant="body2">✓ Quality second-hand fashion</Typography>
              <Typography variant="body2">✓ Affordable sustainable styles</Typography>
              <Typography variant="body2">✓ Pre-loved designer items</Typography>
              <Typography variant="body2">✓ Fashion-forward sustainability</Typography>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1}>
              <IconButton sx={{ color: '#fff', border: '2px solid #000', borderRadius: '50%' }}>
                <AddSharpIcon sx={{ color: 'orangered' }} />
              </IconButton>
              <Typography 
                component={Link} 
                variant="h5" 
                fontFamily="'Times New Roman', serif" 
                sx={{ color: '#fff' }}
              >
                Explore our curated collection of pre-loved treasures
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default ResponsiveHeader;
