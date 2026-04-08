import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  IconButton,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';

// Shared design tokens — matches navbar / bid pages
const COLORS = {
  bg: '#1A1A1A',
  surface: '#222222',
  border: 'rgba(255,255,255,0.10)',
  accent: '#C9A2B4',
  accentDark: '#85586F',
  accentSoft: 'rgba(201,162,180,0.12)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.62)',
};

const SERIF = '"Playfair Display", "Fraunces", Georgia, serif';

const ColumnHeading = ({ children }) => (
  <Typography
    sx={{
      fontSize: 11,
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      fontWeight: 700,
      color: COLORS.accent,
      mb: 2.5,
    }}
  >
    {children}
  </Typography>
);

const FooterLink = ({ to, children }) => (
  <Link
    component={RouterLink}
    to={to}
    sx={{
      color: COLORS.textSecondary,
      fontSize: 14,
      textDecoration: 'none',
      transition: 'color 0.2s ease',
      display: 'inline-block',
      '&:hover': { color: COLORS.accent },
    }}
  >
    {children}
  </Link>
);

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // hook this up to your newsletter endpoint when ready
    setEmail('');
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: COLORS.bg,
        color: COLORS.textPrimary,
        pt: { xs: 6, md: 9 },
        pb: 3,
        px: { xs: 3, md: 6 },
        borderTop: `1px solid ${COLORS.border}`,
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
        <Grid container spacing={{ xs: 5, md: 6 }}>
          {/* Brand + about */}
          <Grid item xs={12} md={4}>
            <Typography
              sx={{
                fontFamily: SERIF,
                fontSize: 30,
                fontWeight: 700,
                color: COLORS.textPrimary,
                lineHeight: 1.1,
                mb: 2,
              }}
            >
              Rewind <Box component="span" sx={{ color: COLORS.accent }}>&</Box> Revive
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: COLORS.textSecondary,
                lineHeight: 1.7,
                mb: 3,
                maxWidth: 340,
              }}
            >
              Discover one-of-a-kind pre-loved pieces. Sustainable fashion,
              auctions, and stories worth reviving.
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[
                { icon: <Facebook fontSize="small" />, label: 'Facebook' },
                { icon: <Instagram fontSize="small" />, label: 'Instagram' },
                { icon: <Twitter fontSize="small" />, label: 'Twitter' },
                { icon: <YouTube fontSize="small" />, label: 'YouTube' },
              ].map((s) => (
                <IconButton
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  sx={{
                    color: COLORS.textSecondary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 2,
                    width: 38,
                    height: 38,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: COLORS.accent,
                      borderColor: COLORS.accent,
                      bgcolor: COLORS.accentSoft,
                    },
                  }}
                >
                  {s.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Browse */}
          <Grid item xs={6} md={2}>
            <ColumnHeading>Browse</ColumnHeading>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/catalogue">Shop</FooterLink>
              <FooterLink to="/bidProduct">Auctions</FooterLink>
              <FooterLink to="/celeb">Celebrity</FooterLink>
            </Box>
          </Grid>

          {/* Company */}
          <Grid item xs={6} md={2}>
            <ColumnHeading>Company</ColumnHeading>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <FooterLink to="/AboutUs">About us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/collaborator">Collaborators</FooterLink>
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <ColumnHeading>Stay in the loop</ColumnHeading>
            <Typography
              sx={{
                fontSize: 14,
                color: COLORS.textSecondary,
                lineHeight: 1.6,
                mb: 2.5,
                maxWidth: 360,
              }}
            >
              New arrivals, upcoming auctions and member-only drops — straight
              to your inbox.
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubscribe}
              sx={{ display: 'flex', gap: 1, maxWidth: 380 }}
            >
              <TextField
                fullWidth
                size="small"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                InputProps={{
                  sx: {
                    bgcolor: COLORS.surface,
                    color: COLORS.textPrimary,
                    borderRadius: 2,
                    fontSize: 14,
                    '& fieldset': { borderColor: COLORS.border },
                    '&:hover fieldset': { borderColor: COLORS.accent },
                    '&.Mui-focused fieldset': { borderColor: COLORS.accent },
                    '& input::placeholder': {
                      color: COLORS.textSecondary,
                      opacity: 1,
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: COLORS.accentDark,
                  color: '#fff',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  px: 2.5,
                  whiteSpace: 'nowrap',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: COLORS.accent, boxShadow: 'none' },
                }}
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: COLORS.border, mt: { xs: 6, md: 8 }, mb: 3 }} />

        {/* Bottom bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: 13, color: COLORS.textSecondary }}>
            © {new Date().getFullYear()} Rewind & Revive. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <FooterLink to="#">Privacy</FooterLink>
            <FooterLink to="#">Terms</FooterLink>
            <FooterLink to="#">Cookies</FooterLink>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
