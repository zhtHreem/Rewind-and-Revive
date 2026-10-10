import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Reusable section header for home-page strips (Recommendations, Bidding, etc.)
 * Replaces the old `border: '2px inset #867070'` band that every section was
 * duplicating, so the page has consistent visual rhythm.
 *
 * Props:
 *   title    – the section title (h2)
 *   subtitle – optional one-line tagline below the title
 *   viewAllTo  – optional react-router path; renders a "View all →" link on the right
 *   viewAllLabel – override label for the view-all link (default: "View all")
 */
const SectionHeader = ({ title, subtitle, eyebrow, viewAllTo, viewAllLabel = 'View all', tone = 'light' }) => {
  const dark = tone === 'dark';
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        mb: { xs: 3, md: 4 },
        pb: 2,
        borderBottom: `1px solid ${dark ? '#3a342d' : '#E3DCCD'}`,
      }}
    >
      <Stack spacing={0.5}>
        {eyebrow && (
          <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? '#D9AFC6' : '#85586F' }}>
            {eyebrow}
          </Typography>
        )}
        <Typography
          component="h2"
          sx={{
            fontFamily: 'var(--font-display)',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            fontWeight: 600,
            lineHeight: 1.15,
            color: dark ? '#F4EFE6' : '#1F1B16',
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontFamily: 'var(--font-body)',
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              color: dark ? '#bdb3a3' : '#6B635A',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Stack>

      {viewAllTo && (
        <Button
          component={RouterLink}
          to={viewAllTo}
          endIcon={<ArrowForwardIcon fontSize="small" />}
          sx={{
            color: dark ? '#F4EFE6' : '#1F1B16',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: 'transparent',
              color: dark ? '#D9AFC6' : '#85586F',
              '& .MuiSvgIcon-root': { transform: 'translateX(3px)' },
            },
            '& .MuiSvgIcon-root': { transition: 'transform 0.2s ease' },
          }}
        >
          {viewAllLabel}
        </Button>
      )}
    </Box>
  );
};

export default SectionHeader;
