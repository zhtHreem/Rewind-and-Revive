// ─────────────────────────────────────────────────────────────────────────────
// About page
//
// PLACEHOLDERS — search for "REPLACE:" comments throughout this file. Anything
// marked that way is generic copy that you should swap with the real story
// (founder name, city, year, real numbers, real photo URLs, real seller quotes).
// Until you fill them in, the page will still render fine — just with
// placeholder text and grey image blocks.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Layout from '../Layout/layout';

// Same design tokens as the rest of the site (catalogue, bidding, recommendations).
const TOKENS = {
  border: '#E5E0DA',
  ink: '#1F1B16',
  inkSoft: '#6B635A',
  bg: '#FFFFFF',
  bgMuted: '#FAF8F5',
  bgDark: '#1F1B16',
  accent: '#867070',
  accentDark: '#576F72',
};

const SERIF = '"Playfair Display", Georgia, serif';

// Reusable image-placeholder so you can drop a real <img> in later.
// REPLACE: swap each <ImageBlock /> for an <img src="..." /> when you have photos.
const ImageBlock = ({ height = 460, label }) => (
  <Box
    sx={{
      width: '100%',
      height,
      backgroundColor: TOKENS.bgMuted,
      border: `1px dashed ${TOKENS.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: TOKENS.inkSoft,
      fontSize: 13,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    }}
  >
    {label || 'Photo'}
  </Box>
);

// One row of "side-by-side text + image" — alternates left/right via the `flip` prop.
const StoryRow = ({ eyebrow, title, children, image, flip = false }) => (
  <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
    <Grid
      container
      spacing={{ xs: 4, md: 8 }}
      alignItems="center"
      direction={{ xs: 'column-reverse', md: flip ? 'row-reverse' : 'row' }}
    >
      <Grid item xs={12} md={6}>
        {eyebrow && (
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
            {eyebrow}
          </Typography>
        )}
        <Typography
          component="h2"
          sx={{
            fontFamily: SERIF,
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            fontWeight: 700,
            color: TOKENS.ink,
            lineHeight: 1.15,
            mb: 3,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ color: TOKENS.inkSoft, fontSize: '1.05rem', lineHeight: 1.75, '& p': { mb: 2 } }}>
          {children}
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        {image}
      </Grid>
    </Grid>
  </Container>
);

const AboutUsPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          backgroundColor: TOKENS.bgMuted,
          borderBottom: `1px solid ${TOKENS.border}`,
          py: { xs: 8, md: 14 },
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
              mb: 3,
              textAlign: 'center',
            }}
          >
            About Rewind &amp; Revive
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: SERIF,
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' },
              fontWeight: 700,
              color: TOKENS.ink,
              lineHeight: 1.1,
              textAlign: 'center',
              mb: 3,
              letterSpacing: '-0.01em',
            }}
          >
            {/* REPLACE: write a one-line hook. Don't say "the future of fashion". */}
            A second life for the clothes already in the world.
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.15rem' },
              color: TOKENS.inkSoft,
              lineHeight: 1.7,
              textAlign: 'center',
              maxWidth: 640,
              mx: 'auto',
            }}
          >
            {/* REPLACE: a real two-sentence summary. Mention the founder, the year, and what makes you different. */}
            We&rsquo;re a small marketplace for pre-loved clothing, built around live
            auctions instead of endless scrolling. Every piece you find here was already
            in someone&rsquo;s closet — and is now looking for someone who&rsquo;ll actually wear it.
          </Typography>
        </Container>
      </Box>

      {/* ─── ORIGIN STORY ──────────────────────────────────────────────── */}
      <StoryRow
        eyebrow="How it started"
        title="It started with a closet full of regret."
        image={<ImageBlock height={500} label="Founder photo" />}
      >
        {/* REPLACE: rewrite this entire block as your real founder story.
            Be specific. Name a city, a year, a moment. */}
        <p>
          In early 2024, I counted forty-three things in my closet I had never worn more
          than twice. Some still had tags. Most were &ldquo;impulse buys for an event&rdquo; that
          I couldn&rsquo;t even remember the name of. They were going to end up in a donation
          bag, and from there&hellip; honestly, I had no idea where.
        </p>
        <p>
          That was the start. I wanted somewhere to send those clothes that wasn&rsquo;t a
          guess. Somewhere a person who wanted them could actually find them, bid on them,
          and put them back into rotation. Rewind &amp; Revive is that place. It started
          tiny — friends listing things to other friends — and it&rsquo;s growing slowly because
          I&rsquo;d rather know everyone here than scale fast and lose the point.
        </p>
        <p>
          {/* REPLACE: signature line — your name, city. */}
          — Hareem, founder
        </p>
      </StoryRow>

      <Divider sx={{ borderColor: TOKENS.border }} />

      {/* ─── WHY BIDDING ───────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: TOKENS.bgMuted }}>
        <StoryRow
          flip
          eyebrow="Why auctions"
          title="Bids beat scrolling."
          image={<ImageBlock height={460} label="Auction in action" />}
        >
          <p>
            Most resale apps work like landfill in reverse: 10,000 listings, infinite
            scroll, and most pieces never get seen. We do the opposite. Sellers list a
            piece for a window of time. Buyers bid. The best fit — for size, for taste,
            for budget — wins.
          </p>
          <p>
            It&rsquo;s slower. That&rsquo;s the point. A bid is a small commitment, and small
            commitments mean clothes actually get worn instead of sitting in a cart for
            three weeks and then getting deleted.
          </p>
        </StoryRow>
      </Box>

      <Divider sx={{ borderColor: TOKENS.border }} />

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
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
            How it works
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontFamily: SERIF,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              color: TOKENS.ink,
              mb: 1,
            }}
          >
            Three steps. Nothing clever.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 4, md: 6 }}>
          {[
            {
              n: '01',
              title: 'List or browse',
              body:
                'Sellers upload pieces from their closet with a few photos and a starting price. Buyers browse the live auctions or shop fixed-price items in the catalogue.',
            },
            {
              n: '02',
              title: 'Bid (or buy)',
              body:
                'For auctions, place a bid before the timer runs out. For fixed-price items, just add to cart. Either way, you&rsquo;re messaging a real person on the other end.',
            },
            {
              n: '03',
              title: 'It ships',
              body:
                'The seller ships within 48 hours. Payment only releases once you confirm it arrived in the condition described. No middleman, no fast fashion.',
            },
          ].map((step) => (
            <Grid item xs={12} md={4} key={step.n}>
              <Box sx={{ position: 'relative', pt: 5 }}>
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    fontFamily: SERIF,
                    fontSize: '4rem',
                    fontWeight: 700,
                    color: TOKENS.bgMuted,
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {step.n}
                </Typography>
                <Typography
                  component="h3"
                  sx={{
                    fontFamily: SERIF,
                    fontSize: '1.35rem',
                    fontWeight: 600,
                    color: TOKENS.ink,
                    mb: 1,
                    position: 'relative',
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  sx={{
                    color: TOKENS.inkSoft,
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    position: 'relative',
                  }}
                  dangerouslySetInnerHTML={{ __html: step.body }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider sx={{ borderColor: TOKENS.border }} />

      {/* ─── IMPACT NUMBERS ────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: TOKENS.bgDark, color: '#fff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#C9C0B6',
              fontWeight: 700,
              mb: 2,
              textAlign: 'center',
            }}
          >
            Since we started
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontFamily: SERIF,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              textAlign: 'center',
              mb: { xs: 5, md: 7 },
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.2,
            }}
          >
            Small numbers we&rsquo;re actually proud of.
          </Typography>

          {/* REPLACE: real numbers from your DB. Don't fake-round to 10,000+ — under-promise. */}
          <Grid container spacing={{ xs: 4, md: 2 }}>
            {[
              { number: '247', label: 'Pieces rehomed' },
              { number: '1,140', label: 'Bids placed' },
              { number: '63', label: 'Active sellers' },
              { number: '~180kg', label: 'Textile kept out of landfill' },
            ].map((s) => (
              <Grid item xs={6} md={3} key={s.label}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontFamily: SERIF,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1,
                      mb: 1,
                    }}
                  >
                    {s.number}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.65)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── PROMISES (what we will / won't do) ───────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
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
            Our promises
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontFamily: SERIF,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              color: TOKENS.ink,
              mb: 1,
            }}
          >
            What we will and won&rsquo;t do.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontFamily: SERIF,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: TOKENS.ink,
                mb: 3,
              }}
            >
              We will
            </Typography>
            <Stack spacing={2}>
              {[
                'Only list secondhand pieces from real people.',
                'Show seller usernames on every listing — no anonymous shops.',
                'Hold payment until you confirm the item arrived.',
                'Reply to messages within 24 hours, weekdays.',
              ].map((p) => (
                <Box key={p} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <CheckIcon sx={{ color: TOKENS.accent, fontSize: 22, mt: '2px' }} />
                  <Typography sx={{ color: TOKENS.ink, fontSize: '1rem', lineHeight: 1.6 }}>{p}</Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontFamily: SERIF,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: TOKENS.ink,
                mb: 3,
              }}
            >
              We won&rsquo;t
            </Typography>
            <Stack spacing={2}>
              {[
                'Allow new fast-fashion stock or dropshipped listings.',
                'Sell or share your data with anyone.',
                'Run psychological pricing tricks or fake countdowns.',
                'Pretend we&rsquo;re bigger than we are.',
              ].map((p) => (
                <Box key={p} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <CloseIcon sx={{ color: TOKENS.inkSoft, fontSize: 22, mt: '2px' }} />
                  <Typography
                    sx={{ color: TOKENS.ink, fontSize: '1rem', lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: p }}
                  />
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* ─── CTA ───────────────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component="h2"
              sx={{
                fontFamily: SERIF,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                color: TOKENS.ink,
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              Come look around.
            </Typography>
            <Typography sx={{ color: TOKENS.inkSoft, fontSize: '1.05rem', mb: 5, maxWidth: 520, mx: 'auto' }}>
              Browse the live auctions, or send us a message if you have a piece you&rsquo;d
              like to list. We read everything.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Button
                onClick={() => navigate('/catalogue')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  backgroundColor: TOKENS.ink,
                  color: '#fff',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  borderRadius: 1,
                  '&:hover': { backgroundColor: TOKENS.accentDark },
                }}
              >
                Browse the shop
              </Button>
              <Button
                component={RouterLink}
                to="/contact"
                sx={{
                  color: TOKENS.ink,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  borderRadius: 1,
                  border: `1px solid ${TOKENS.border}`,
                  '&:hover': { backgroundColor: TOKENS.bgMuted, borderColor: TOKENS.accent },
                }}
              >
                Get in touch
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};

export default AboutUsPage;
