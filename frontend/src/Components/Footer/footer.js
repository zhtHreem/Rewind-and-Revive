import React from 'react';
import { Box, Grid, Typography, TextField, Button,Stack, Link } from '@mui/material';
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#8B7E74',
        color: 'white',
        py: 6,
        px: { xs: 4, md: 8 },
      }}
    >
      <Grid container spacing={4}>
        {/* Store Info */}
        <Grid item xs={12} md={4}>
        <Stack direction="row"  px={{xs:1,md:3,xl:4}}>
          <Typography variant="h4" className="logo" > 
            <span style={{fontWeight:"bold"}}> Rewind</span>
            <span style={{color: "#EAC7C7"}}>&</span>
            <span style={{fontWeight:"bold"}} className="bold">Revive</span> 
          </Typography>
          </Stack>
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            Discover the best second-hand clothing at affordable prices. We are
            dedicated to providing sustainable and stylish fashion choices.
          </Typography>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Quick Links
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Link href="#" color="inherit" underline="hover">
              Home
            </Link>
            <Link href="#" color="inherit" underline="hover">
              Shop
            </Link>
            <Link href="#" color="inherit" underline="hover">
              About Us
            </Link>
            <Link href="#" color="inherit" underline="hover">
              Contact
            </Link>
          </Box>
        </Grid>

        {/* Newsletter */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Subscribe to our Newsletter
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            Get the latest updates on new arrivals and discounts!
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Enter your email"
            size="small"
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              marginBottom: 2,
              width: '100%',
            }}
          />
          <Button
            variant="contained"
            sx={{
              width: '100%',
              backgroundColor: '#85586F',
              '&:hover': {
                backgroundColor: 'black',
              },
            }}
          >
            Subscribe
          </Button>
        </Grid>
      </Grid>

      {/* Social Media Icons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
          gap: 3,
        }}
      >
        <Link href="#" color="inherit">
          <Facebook />
        </Link>
        <Link href="#" color="inherit">
          <Twitter />
        </Link>
        <Link href="#" color="inherit">
          <Instagram />
        </Link>
        <Link href="#" color="inherit">
          <YouTube />
        </Link>
      </Box>

      {/* Footer Bottom */}
      <Box
        sx={{
          textAlign: 'center',
          mt: 4,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          pt: 2,
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Thrift Store. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
