import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  IconButton,
  Skeleton,
  Stack,
  Chip,
  Divider,
  Container,
  Breadcrumbs,
  Link as MuiLink,
  Radio,
  RadioGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Layout from "../Layout/layout";
import axios from 'axios';
import sizeRanges from "../Utils/sizeRange";

// Lazy-load less critical components
const SizeChartMUI = React.lazy(() => import("./sizechart"));
const FilterDrawer = React.lazy(() => import("./filter"));

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens — keeping these in one place so the page is visually consistent.
// ─────────────────────────────────────────────────────────────────────────────
const TOKENS = {
  border: '#E5E0DA',
  borderHover: '#C9C0B6',
  ink: '#1F1B16',
  inkSoft: '#6B635A',
  bg: '#FFFFFF',
  bgMuted: '#FAF8F5',
  accent: '#867070',
  accentDark: '#576F72',
  sold: 'rgba(0, 0, 0, 0.55)',
};

const SIDEBAR_WIDTH = 260;

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton matching the real product card so loading doesn't shift layout
// ─────────────────────────────────────────────────────────────────────────────
const ProductCardSkeleton = () => (
  <Card elevation={0} sx={{ border: `1px solid ${TOKENS.border}`, borderRadius: 2, overflow: 'hidden' }}>
    <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '4/5' }} />
    <CardContent sx={{ p: 1.5 }}>
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="40%" height={20} />
      <Skeleton variant="text" width="60%" height={16} />
    </CardContent>
  </Card>
);

// ─────────────────────────────────────────────────────────────────────────────
// Product card — single component, sane click targets, hover effect, no full-page reloads
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = React.memo(function ProductCard({ product, isFavorite, onToggleFavorite }) {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  const secondImage = product.images && product.images[1];
  const displayImage = hover && secondImage ? secondImage : (product.images && product.images[0]);

  const handleSellerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.owner?._id) navigate(`/profile/${product.owner._id}`);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(product._id);
  };

  return (
    <Card
      elevation={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        position: 'relative',
        backgroundColor: TOKENS.bg,
        border: `1px solid ${TOKENS.border}`,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: TOKENS.borderHover,
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
        },
      }}
    >
      {/* Image area: a clickable RouterLink covering the whole image */}
      <Box
        component={RouterLink}
        to={`/product/${product._id}`}
        sx={{
          display: 'block',
          position: 'relative',
          width: '100%',
          aspectRatio: '4/5',
          backgroundColor: TOKENS.bgMuted,
          overflow: 'hidden',
        }}
      >
        {displayImage && (
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="400"
            height="500"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: product.isSold ? 'grayscale(70%)' : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />
        )}

        {/* Favorite heart — top right, stops bubbling so card link doesn't fire */}
        <IconButton
          size="small"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(4px)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
          }}
        >
          {isFavorite
            ? <FavoriteIcon fontSize="small" sx={{ color: '#E63946' }} />
            : <FavoriteBorderIcon fontSize="small" sx={{ color: TOKENS.ink }} />}
        </IconButton>

        {/* Sold pill — corner, not a bottom bar */}
        {product.isSold && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: TOKENS.sold,
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              px: 1,
              py: 0.4,
              borderRadius: 1,
              textTransform: 'uppercase',
            }}
          >
            Sold
          </Box>
        )}
      </Box>

      {/* Body */}
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box
          component={RouterLink}
          to={`/product/${product._id}`}
          sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: TOKENS.ink,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.25,
            }}
          >
            {product.name}
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 700, color: TOKENS.ink, mb: 0.25 }}
          >
            Rs. {product.price?.toLocaleString() ?? product.price}
          </Typography>
        </Box>
        {product.owner?.username && (
          <Typography
            variant="caption"
            onClick={handleSellerClick}
            sx={{
              color: TOKENS.inkSoft,
              cursor: 'pointer',
              '&:hover': { color: TOKENS.ink, textDecoration: 'underline' },
            }}
          >
            @{product.owner.username}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar facet — consistent accordion wrapper for every filter group
// ─────────────────────────────────────────────────────────────────────────────
const Facet = ({ title, defaultExpanded = true, children }) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    elevation={0}
    sx={{
      backgroundColor: 'transparent',
      borderBottom: `1px solid ${TOKENS.border}`,
      '&:before': { display: 'none' },
      '&.Mui-expanded': { margin: 0 },
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      sx={{ px: 0, minHeight: 48, '&.Mui-expanded': { minHeight: 48 } }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '0.85rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: TOKENS.ink,
        }}
      >
        {title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
      {children}
    </AccordionDetails>
  </Accordion>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
const CataloguePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Render-window: only mount this many cards to keep DOM cheap
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const defaultCategories = ['men', 'women', 'kids'];
  const productTypes = ['top', 'bottom', 'top/bottom', 'accessories'];
  const sizes = ['small', 'medium', 'large'];
  const priceOptions = [1000, 2000, 3000];

  // ── Data fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/catalogue`);
        if (cancelled) return;
        const processedProducts = response.data.map((product) => ({
          ...product,
          category: defaultCategories.includes(product.category?.toLowerCase())
            ? product.category.toLowerCase()
            : 'other',
        }));
        setProducts(processedProducts);
      } catch (error) {
        console.error("There was an error fetching the products!", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync ?search= query param ─────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

  // ── Filtering / sorting (logic preserved from previous version) ───────────
  const isWithinSizeRange = (product, cat, size) => {
    if (!product || !cat || !size || !sizeRanges[cat]?.[size]) return false;
    const { type, topSizes, bottomSizes } = product;
    if (type === 'accessories') return true;

    const checkMeasurements = (measurements, rangeType) => {
      if (!measurements || !sizeRanges[cat][size][rangeType]) return false;
      const rangeForSize = sizeRanges[cat][size][rangeType];
      let hasValidMeasurements = false;
      for (const [measurement, value] of Object.entries(measurements)) {
        if (!value || !rangeForSize[measurement]) continue;
        hasValidMeasurements = true;
        const range = rangeForSize[measurement];
        if (value < range.min || value > range.max) return false;
      }
      return hasValidMeasurements;
    };

    switch (type?.toLowerCase()) {
      case 'top': return checkMeasurements(topSizes, 'top');
      case 'bottom': return checkMeasurements(bottomSizes, 'bottom');
      case 'top/bottom': return checkMeasurements(topSizes, 'top') && checkMeasurements(bottomSizes, 'bottom');
      default: return false;
    }
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryMatch = !category || product.category === category;
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type);
      const priceMatch = !priceRange || product.price <= parseInt(priceRange);
      const sizeMatch = selectedSizes.length === 0 ||
        selectedSizes.some((size) => isWithinSizeRange(product, product.category, size));
      const searchMatch = !searchQuery ||
        (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return categoryMatch && typeMatch && sizeMatch && priceMatch && searchMatch;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-high': sorted.sort((a, b) => b.price - a.price); break;
      case 'price-low':  sorted.sort((a, b) => a.price - b.price); break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, category, selectedTypes, selectedSizes, priceRange, sortBy, searchQuery]);

  // Reset render window when filters change so users don't get stuck on Load More
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, selectedTypes, selectedSizes, priceRange, sortBy, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  // ── Filter helpers ────────────────────────────────────────────────────────
  const hasActiveFilters = !!(category || selectedTypes.length || selectedSizes.length || priceRange || searchQuery);

  const clearAllFilters = () => {
    setCategory('');
    setSelectedTypes([]);
    setSelectedSizes([]);
    setPriceRange('');
    if (searchQuery) {
      setSearchQuery('');
      const params = new URLSearchParams(location.search);
      params.delete('search');
      navigate(`/catalogue${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    }
  };

  const removeChip = (kind, value) => {
    if (kind === 'category') setCategory('');
    else if (kind === 'type') setSelectedTypes((t) => t.filter((x) => x !== value));
    else if (kind === 'size') setSelectedSizes((s) => s.filter((x) => x !== value));
    else if (kind === 'price') setPriceRange('');
    else if (kind === 'search') {
      setSearchQuery('');
      const params = new URLSearchParams(location.search);
      params.delete('search');
      navigate(`/catalogue${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    }
  };

  // ── Filter counts (so users know what each option will return) ────────────
  const facetCounts = useMemo(() => {
    const base = products.filter((p) => {
      const searchMatch = !searchQuery || (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return searchMatch;
    });
    const counts = {
      category: {},
      type: {},
    };
    defaultCategories.forEach((c) => { counts.category[c] = base.filter((p) => p.category === c).length; });
    productTypes.forEach((t) => { counts.type[t] = base.filter((p) => p.type === t).length; });
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchQuery]);

  // ── Favorites (visual-only for now — store in localStorage for persistence) ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rr_favorites');
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem('rr_favorites', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>

        {/* Breadcrumbs */}
        <Breadcrumbs separator="›" sx={{ mb: 1, fontSize: '0.85rem' }}>
          <MuiLink component={RouterLink} to="/" underline="hover" color="inherit">Home</MuiLink>
          <Typography color="text.primary" sx={{ fontSize: '0.85rem' }}>Shop</Typography>
        </Breadcrumbs>

        {/* Page header */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              fontWeight: 700,
              color: TOKENS.ink,
              mb: 0.5,
            }}
          >
            {searchQuery ? `Results for "${searchQuery}"` : 'Shop All'}
          </Typography>
          <Typography variant="body2" sx={{ color: TOKENS.inkSoft }}>
            {loading
              ? 'Loading items…'
              : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'}${filteredProducts.length !== products.length ? ` (of ${products.length})` : ''}`}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3, borderColor: TOKENS.border }} />

        {/* Mobile filter trigger + drawer (the drawer renders its own button on mobile) */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
          <Suspense fallback={null}>
            <FilterDrawer
              isOpen={isFilterOpen}
              onClose={setIsFilterOpen}
              categories={defaultCategories}
              sizes={sizes}
              productTypes={productTypes}
              priceRanges={priceOptions}
              category={category}
              selectedSizes={selectedSizes}
              selectedTypes={selectedTypes}
              priceRange={priceRange}
              setCategory={setCategory}
              setSelectedSizes={setSelectedSizes}
              setSelectedTypes={setSelectedTypes}
              setPriceRange={setPriceRange}
            />
          </Suspense>
        </Box>

        <Box sx={{ display: 'flex', gap: { md: 4 } }}>

          {/* ───────── DESKTOP SIDEBAR ───────── */}
          <Box
            component="aside"
            sx={{
              display: { xs: 'none', md: 'block' },
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              alignSelf: 'flex-start',
              position: 'sticky',
              top: 24,
              maxHeight: 'calc(100vh - 48px)',
              overflowY: 'auto',
              pr: 1,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: TOKENS.ink }}>
                Filters
              </Typography>
              {hasActiveFilters && (
                <Button
                  size="small"
                  onClick={clearAllFilters}
                  sx={{ color: TOKENS.inkSoft, textTransform: 'none', fontSize: '0.8rem' }}
                >
                  Clear all
                </Button>
              )}
            </Stack>

            {/* Category — single-select RADIO (matches behavior) */}
            <Facet title="Category">
              <RadioGroup
                value={category}
                onChange={(e) => setCategory(e.target.value === category ? '' : e.target.value)}
              >
                {defaultCategories.map((cat) => (
                  <FormControlLabel
                    key={cat}
                    value={cat}
                    control={<Radio size="small" sx={{ py: 0.25 }} />}
                    label={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 200, fontSize: '0.875rem' }}>
                        <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                        <span style={{ color: TOKENS.inkSoft }}>{facetCounts.category[cat] ?? 0}</span>
                      </Box>
                    }
                    onClick={(e) => {
                      // Allow clicking the selected radio again to deselect
                      if (category === cat) {
                        e.preventDefault();
                        setCategory('');
                      }
                    }}
                    sx={{ mr: 0, '& .MuiFormControlLabel-label': { width: '100%' } }}
                  />
                ))}
              </RadioGroup>
            </Facet>

            {/* Size — only meaningful with a category */}
            {category && (
              <Facet title="Size">
                {sizes.map((size) => (
                  <FormControlLabel
                    key={size}
                    sx={{ display: 'flex', mr: 0 }}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedSizes.includes(size)}
                        onChange={() => {
                          setSelectedSizes((prev) =>
                            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                          );
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '0.875rem' }}>{size.toUpperCase()}</Typography>
                    }
                  />
                ))}
              </Facet>
            )}

            {/* Product type — multi-select CHECKBOX */}
            <Facet title="Type">
              {productTypes.map((type) => (
                <FormControlLabel
                  key={type}
                  sx={{ display: 'flex', mr: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedTypes.includes(type)}
                      onChange={() => {
                        setSelectedTypes((prev) =>
                          prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                        );
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 200, fontSize: '0.875rem' }}>
                      <span style={{ textTransform: 'capitalize' }}>{type}</span>
                      <span style={{ color: TOKENS.inkSoft }}>{facetCounts.type[type] ?? 0}</span>
                    </Box>
                  }
                />
              ))}
            </Facet>

            {/* Price — single-select RADIO with deselect-on-reclick */}
            <Facet title="Price">
              <RadioGroup
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                {priceOptions.map((price) => (
                  <FormControlLabel
                    key={price}
                    value={price.toString()}
                    control={<Radio size="small" sx={{ py: 0.25 }} />}
                    label={<Typography sx={{ fontSize: '0.875rem' }}>Up to Rs. {price.toLocaleString()}</Typography>}
                    onClick={(e) => {
                      if (priceRange === price.toString()) {
                        e.preventDefault();
                        setPriceRange('');
                      }
                    }}
                  />
                ))}
              </RadioGroup>
            </Facet>
          </Box>

          {/* ───────── MAIN CONTENT ───────── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Sort row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="body2" sx={{ color: TOKENS.inkSoft }}>
                Showing {visibleProducts.length} of {filteredProducts.length}
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Tooltip title="Size guide">
                  <Box>
                    <Suspense fallback={<Skeleton variant="rectangular" width={40} height={36} />}>
                      <SizeChartMUI />
                    </Suspense>
                  </Box>
                </Tooltip>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort by"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="newest">Newest first</MenuItem>
                    <MenuItem value="price-low">Price: low to high</MenuItem>
                    <MenuItem value="price-high">Price: high to low</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {category && (
                  <Chip
                    label={`Category: ${category}`}
                    onDelete={() => removeChip('category')}
                    deleteIcon={<CloseIcon />}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                )}
                {selectedTypes.map((t) => (
                  <Chip
                    key={t}
                    label={`Type: ${t}`}
                    onDelete={() => removeChip('type', t)}
                    deleteIcon={<CloseIcon />}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
                {selectedSizes.map((s) => (
                  <Chip
                    key={s}
                    label={`Size: ${s.toUpperCase()}`}
                    onDelete={() => removeChip('size', s)}
                    deleteIcon={<CloseIcon />}
                    size="small"
                  />
                ))}
                {priceRange && (
                  <Chip
                    label={`Up to Rs. ${parseInt(priceRange).toLocaleString()}`}
                    onDelete={() => removeChip('price')}
                    deleteIcon={<CloseIcon />}
                    size="small"
                  />
                )}
                {searchQuery && (
                  <Chip
                    label={`Search: "${searchQuery}"`}
                    onDelete={() => removeChip('search')}
                    deleteIcon={<CloseIcon />}
                    size="small"
                  />
                )}
                <Button
                  size="small"
                  onClick={clearAllFilters}
                  sx={{ color: TOKENS.inkSoft, textTransform: 'none', fontSize: '0.8rem' }}
                >
                  Clear all
                </Button>
              </Stack>
            )}

            {/* Product grid */}
            {loading ? (
              <Grid container spacing={2}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <Grid item xs={6} sm={4} md={4} lg={3} key={i}>
                    <ProductCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : filteredProducts.length === 0 ? (
              // Empty state
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  py: { xs: 6, md: 10 },
                  px: 2,
                  border: `1px dashed ${TOKENS.border}`,
                  borderRadius: 2,
                  backgroundColor: TOKENS.bgMuted,
                }}
              >
                <SearchOffIcon sx={{ fontSize: 56, color: TOKENS.inkSoft, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: TOKENS.ink }}>
                  No items match your filters
                </Typography>
                <Typography variant="body2" sx={{ color: TOKENS.inkSoft, mb: 3, maxWidth: 360 }}>
                  Try removing a filter or two, or clear them all to see everything we have.
                </Typography>
                <Button
                  variant="contained"
                  onClick={clearAllFilters}
                  sx={{
                    backgroundColor: TOKENS.accent,
                    '&:hover': { backgroundColor: TOKENS.accentDark },
                    textTransform: 'none',
                  }}
                >
                  Clear all filters
                </Button>
              </Box>
            ) : (
              <>
                <Grid container spacing={2}>
                  {visibleProducts.map((product) => (
                    <Grid item xs={6} sm={4} md={4} lg={3} key={product._id}>
                      <ProductCard
                        product={product}
                        isFavorite={favorites.has(product._id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Load more */}
                {visibleCount < filteredProducts.length && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      sx={{
                        color: TOKENS.ink,
                        borderColor: TOKENS.border,
                        textTransform: 'none',
                        px: 4,
                        py: 1,
                        '&:hover': {
                          borderColor: TOKENS.borderHover,
                          backgroundColor: TOKENS.bgMuted,
                        },
                      }}
                    >
                      Load more ({filteredProducts.length - visibleCount} remaining)
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default CataloguePage;
