// ─────────────────────────────────────────────────────────────────────────────
// Contact page
//
// PLACEHOLDERS — search for "REPLACE:" comments. Anything marked that way is
// generic placeholder text/info you should swap with real values:
//   - Email address
//   - Instagram / social handles
//   - Response time
//   - Form submission endpoint (currently a stub that just shows success)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  TextField,
  Button,
  MenuItem,
  Divider,
  Link as MuiLink,
  Alert,
  Fade,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Layout from '../Layout/layout';

// Same design tokens as the rest of the site.
const TOKENS = {
  border: '#E5E0DA',
  ink: '#1F1B16',
  inkSoft: '#6B635A',
  bg: '#FFFFFF',
  bgMuted: '#FAF8F5',
  accent: '#867070',
  accentDark: '#576F72',
};

const SERIF = '"Playfair Display", Georgia, serif';

// REPLACE: real contact details
const CONTACT_INFO = {
  email: 'hello@rewindandrevive.com',
  instagram: '@rewindandrevive',
  instagramUrl: 'https://instagram.com/rewindandrevive',
  responseTime: 'within 24 hours, weekdays',
};

// Topic options for the form's subject dropdown
const TOPICS = [
  { value: 'general', label: 'General question' },
  { value: 'selling', label: 'I want to list items' },
  { value: 'order', label: 'About a recent order' },
  { value: 'auction', label: 'About an auction or bid' },
  { value: 'press', label: 'Press / collaboration' },
  { value: 'other', label: 'Something else' },
];

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'general',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // REPLACE: wire this up to your real /api/contact endpoint when ready.
      // For now we just simulate a delay and show the success state.
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSubmitted(true);
      setFormData({ name: '', email: '', topic: 'general', message: '' });
    } catch (err) {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  // Shared text-field styling so every input matches the rest of the site.
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      backgroundColor: TOKENS.bg,
      '& fieldset': { borderColor: TOKENS.border },
      '&:hover fieldset': { borderColor: TOKENS.accent },
      '&.Mui-focused fieldset': { borderColor: TOKENS.accent, borderWidth: 1 },
    },
    '& .MuiInputLabel-root': { color: TOKENS.inkSoft },
    '& .MuiInputLabel-root.Mui-focused': { color: TOKENS.accent },
  };

  return (
    <Layout>
      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          backgroundColor: TOKENS.bgMuted,
          borderBottom: `1px solid ${TOKENS.border}`,
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: TOKENS.accent,
              fontWeight: 700,
              mb: 2,
              textAlign: 'center',
            }}
          >
            Contact
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: SERIF,
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
              fontWeight: 700,
              color: TOKENS.ink,
              lineHeight: 1.1,
              textAlign: 'center',
              mb: 2,
              letterSpacing: '-0.01em',
            }}
          >
            Say hello.
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.1rem' },
              color: TOKENS.inkSoft,
              lineHeight: 1.7,
              textAlign: 'center',
              maxWidth: 560,
              mx: 'auto',
            }}
          >
            Question about an order, want to list a piece, or just want to talk about
            sustainable fashion? We read every message.
          </Typography>
        </Container>
      </Box>

      {/* ─── MAIN CONTACT BODY ──────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={{ xs: 6, md: 8 }}>

          {/* ── LEFT: contact info + meta ── */}
          <Grid item xs={12} md={5}>
            <Typography
              sx={{
                fontSize: 12,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: TOKENS.accent,
                fontWeight: 700,
                mb: 2,
              }}
            >
              How to reach us
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily: SERIF,
                fontSize: { xs: '1.5rem', md: '1.85rem' },
                fontWeight: 700,
                color: TOKENS.ink,
                mb: 4,
                lineHeight: 1.2,
              }}
            >
              The fastest ways to get a real reply.
            </Typography>

            <Stack spacing={3.5}>
              {/* Email */}
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1,
                    backgroundColor: TOKENS.bgMuted,
                    border: `1px solid ${TOKENS.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <EmailOutlinedIcon sx={{ color: TOKENS.accent, fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: TOKENS.inkSoft,
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Email
                  </Typography>
                  <MuiLink
                    href={`mailto:${CONTACT_INFO.email}`}
                    sx={{
                      color: TOKENS.ink,
                      fontSize: '1rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      '&:hover': { color: TOKENS.accent, textDecoration: 'underline' },
                    }}
                  >
                    {CONTACT_INFO.email}
                  </MuiLink>
                </Box>
              </Box>

              {/* Instagram */}
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1,
                    backgroundColor: TOKENS.bgMuted,
                    border: `1px solid ${TOKENS.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <InstagramIcon sx={{ color: TOKENS.accent, fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: TOKENS.inkSoft,
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Instagram
                  </Typography>
                  <Typography
                    sx={{
                      color: TOKENS.ink,
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  >
                    {CONTACT_INFO.instagram}
                  </Typography>
                </Box>
              </Box>

              {/* Response time */}
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1,
                    backgroundColor: TOKENS.bgMuted,
                    border: `1px solid ${TOKENS.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AccessTimeIcon sx={{ color: TOKENS.accent, fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: TOKENS.inkSoft,
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Response time
                  </Typography>
                  <Typography sx={{ color: TOKENS.ink, fontSize: '1rem', fontWeight: 500 }}>
                    {CONTACT_INFO.responseTime}
                  </Typography>
                </Box>
              </Box>
            </Stack>

            <Divider sx={{ my: 5, borderColor: TOKENS.border }} />

            {/* Mini "before you message" tip */}
            <Box
              sx={{
                p: 3,
                backgroundColor: TOKENS.bgMuted,
                border: `1px solid ${TOKENS.border}`,
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
                <HelpOutlineIcon sx={{ color: TOKENS.accent, fontSize: 20, mt: '2px' }} />
                <Typography
                  sx={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: TOKENS.ink,
                  }}
                >
                  Before you message
                </Typography>
              </Box>
              <Typography sx={{ color: TOKENS.inkSoft, fontSize: '0.9rem', lineHeight: 1.6 }}>
                If you have a question about a specific listing or auction, mention the
                item name or URL in your message — it speeds things up a lot.
              </Typography>
            </Box>
          </Grid>

          {/* ── RIGHT: form ── */}
          <Grid item xs={12} md={7}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: { xs: 3, md: 5 },
                backgroundColor: TOKENS.bg,
                border: `1px solid ${TOKENS.border}`,
                borderRadius: 2,
              }}
            >
              <Typography
                component="h2"
                sx={{
                  fontFamily: SERIF,
                  fontSize: { xs: '1.5rem', md: '1.85rem' },
                  fontWeight: 700,
                  color: TOKENS.ink,
                  mb: 1,
                }}
              >
                Send a message
              </Typography>
              <Typography sx={{ color: TOKENS.inkSoft, fontSize: '0.9rem', mb: 4 }}>
                We&rsquo;ll reply to the email you give us — usually the same day.
              </Typography>

              <Fade in={submitted}>
                <Box sx={{ display: submitted ? 'block' : 'none', mb: 3 }}>
                  <Alert
                    severity="success"
                    onClose={() => setSubmitted(false)}
                    sx={{ borderRadius: 1, alignItems: 'center' }}
                  >
                    Thanks — your message is in. We&rsquo;ll get back to you soon.
                  </Alert>
                </Box>
              </Fade>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                  {error}
                </Alert>
              )}

              <Stack spacing={2.5}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>

                <TextField
                  select
                  fullWidth
                  label="What's this about?"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  sx={inputSx}
                >
                  {TOPICS.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  label="Your message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  sx={inputSx}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, pt: 1 }}>
                  <Typography sx={{ color: TOKENS.inkSoft, fontSize: '0.8rem' }}>
                    By sending, you agree we can email you back. We don&rsquo;t share your details.
                  </Typography>
                  <Button
                    type="submit"
                    disabled={submitting}
                    endIcon={!submitting && <ArrowForwardIcon />}
                    sx={{
                      backgroundColor: TOKENS.ink,
                      color: '#fff',
                      px: 4,
                      py: 1.25,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      borderRadius: 1,
                      '&:hover': { backgroundColor: TOKENS.accentDark },
                      '&:disabled': { backgroundColor: TOKENS.inkSoft, color: '#fff' },
                    }}
                  >
                    {submitting ? 'Sending…' : 'Send message'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ─── FAQ STRIP ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          backgroundColor: TOKENS.bgMuted,
          borderTop: `1px solid ${TOKENS.border}`,
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography
              sx={{
                fontSize: 12,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: TOKENS.accent,
                fontWeight: 700,
                mb: 2,
              }}
            >
              Quick answers
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily: SERIF,
                fontSize: { xs: '1.6rem', md: '2.25rem' },
                fontWeight: 700,
                color: TOKENS.ink,
                mb: 1,
                lineHeight: 1.2,
              }}
            >
              The things we get asked most.
            </Typography>
          </Box>

          {/* REPLACE: real FAQs once you know what you actually get asked. */}
          <Grid container spacing={{ xs: 4, md: 5 }}>
            {[
              {
                q: 'How do I list an item?',
                a: 'Sign in, then hit the + button in the navbar and choose "Sell" or "Auction". You\'ll need 2-3 photos and a starting price.',
              },
              {
                q: 'When do bids end?',
                a: 'Each auction has its own timer set by the seller — usually between 24 hours and 7 days. The countdown is on every listing page.',
              },
              {
                q: 'Is payment safe?',
                a: 'Yes. Payment is held until you confirm the item arrived as described. If something\'s wrong, we refund.',
              },
              {
                q: 'Do you ship internationally?',
                a: 'Each seller sets their own shipping zones. You\'ll see the shipping options before you bid or buy.',
              },
            ].map((f) => (
              <Grid item xs={12} md={6} key={f.q}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: SERIF,
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: TOKENS.ink,
                      mb: 1,
                    }}
                  >
                    {f.q}
                  </Typography>
                  <Typography sx={{ color: TOKENS.inkSoft, fontSize: '0.95rem', lineHeight: 1.7 }}>
                    {f.a}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
};

export default ContactUs;
