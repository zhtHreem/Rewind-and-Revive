import React, { useState, useEffect , useMemo } from "react";
import { Box, Grid, Typography, Button, Checkbox, Link, FormControlLabel, useMediaQuery, Card, CardMedia, CardContent, FormControl, Select, InputLabel, MenuItem, IconButton } from "@mui/material";
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import Layout from "../Layout/layout";
import axios from 'axios';

// Size ranges based on standard measurements (in inches)
const sizeRanges = {
  women: {
    small: {
      top: {
        bustChest: { min: 1, max: 34 },
        waist: { min: 1, max: 27 },
        hips: { min: 1, max: 37 },
        shoulderWidth: { min: 1, max: 15 },
        armLength: { min: 1, max: 31 },
        neckCircumference: { min: 1, max: 14 }
      },
      bottom: {
        waist: { min: 24, max: 27 },
        hips: { min: 34, max: 37 },
        inseam: { min: 29, max: 30 },
        thighLegOpening: { min: 19, max: 21 },
        rise: { min: 9, max: 10 }
      }
    },
    medium: {
      top: {
        bustChest: { min: 35, max: 38 },
        waist: { min: 28, max: 31 },
        hips: { min: 38, max: 41 },
        shoulderWidth: { min: 15, max: 16 },
        armLength: { min: 31, max: 32 },
        neckCircumference: { min: 14, max: 15 }
      },
      bottom: {
        waist: { min: 28, max: 31 },
        hips: { min: 38, max: 41 },
        inseam: { min: 30, max: 31 },
        thighLegOpening: { min: 21, max: 23 },
        rise: { min: 10, max: 11 }
      }
    },
    large: {
      top: {
        bustChest: { min: 39, max: 42 },
        waist: { min: 32, max: 35 },
        hips: { min: 42, max: 45 },
        shoulderWidth: { min: 16, max: 17 },
        armLength: { min: 32, max: 33 },
        neckCircumference: { min: 15, max: 16 }
      },
      bottom: {
        waist: { min: 32, max: 35 },
        hips: { min: 42, max: 45 },
        inseam: { min: 31, max: 32 },
        thighLegOpening: { min: 23, max: 25 },
        rise: { min: 11, max: 12 }
      }
    }
  },
  men: {
    small: {
      top: {
        bustChest: { min: 34, max: 36 },
        waist: { min: 28, max: 30 },
        shoulderWidth: { min: 16, max: 17 },
        armLength: { min: 32, max: 33 },
        neckCircumference: { min: 14, max: 15 }
      },
      bottom: {
        waist: { min: 28, max: 30 },
        hips: { min: 35, max: 37 },
        inseam: { min: 30, max: 31 },
        thighLegOpening: { min: 21, max: 22 },
        rise: { min: 10, max: 11 }
      }
    },
    medium: {
      top: {
        bustChest: { min: 37, max: 40 },
        waist: { min: 31, max: 34 },
        shoulderWidth: { min: 17, max: 18 },
        armLength: { min: 33, max: 34 },
        neckCircumference: { min: 15, max: 16 }
      },
      bottom: {
        waist: { min: 31, max: 34 },
        hips: { min: 38, max: 41 },
        inseam: { min: 31, max: 32 },
        thighLegOpening: { min: 22, max: 24 },
        rise: { min: 11, max: 12 }
      }
    },
    large: {
      top: {
        bustChest: { min: 41, max: 44 },
        waist: { min: 35, max: 38 },
        shoulderWidth: { min: 18, max: 19 },
        armLength: { min: 34, max: 35 },
        neckCircumference: { min: 16, max: 17 }
      },
      bottom: {
        waist: { min: 35, max: 38 },
        hips: { min: 42, max: 45 },
        inseam: { min: 32, max: 33 },
        thighLegOpening: { min: 24, max: 26 },
        rise: { min: 12, max: 13 }
      }
    }
  },
  kids: {
    small: {
      top: {
        bustChest: { min: 24, max: 26 },
        waist: { min: 22, max: 23 },
        shoulderWidth: { min: 12, max: 13 },
        armLength: { min: 20, max: 22 },
        neckCircumference: { min: 11, max: 12 }
      },
      bottom: {
        waist: { min: 22, max: 23 },
        hips: { min: 26, max: 28 },
        inseam: { min: 20, max: 22 },
        thighLegOpening: { min: 14, max: 15 },
        rise: { min: 7, max: 8 }
      }
    },
    medium: {
      top: {
        bustChest: { min: 27, max: 29 },
        waist: { min: 24, max: 25 },
        shoulderWidth: { min: 13, max: 14 },
        armLength: { min: 22, max: 24 },
        neckCircumference: { min: 12, max: 13 }
      },
      bottom: {
        waist: { min: 24, max: 25 },
        hips: { min: 29, max: 31 },
        inseam: { min: 22, max: 24 },
        thighLegOpening: { min: 15, max: 16 },
        rise: { min: 8, max: 9 }
      }
    },
    large: {
      top: {
        bustChest: { min: 30, max: 32 },
        waist: { min: 26, max: 27 },
        shoulderWidth: { min: 14, max: 15 },
        armLength: { min: 24, max: 26 },
        neckCircumference: { min: 13, max: 14 }
      },
      bottom: {
        waist: { min: 26, max: 27 },
        hips: { min: 32, max: 34 },
        inseam: { min: 24, max: 26 },
        thighLegOpening: { min: 16, max: 17 },
        rise: { min: 9, max: 10 }
      }
    }
  }
};

const CataloguePage = () => {
    const [products, setProducts] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showSizeDropdown, setShowSizeDropdown] = useState(false);
    const [category, setCategory] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [priceRange, setPriceRange] = useState('');
    const [showFilters, setShowFilters] = useState([]);
    const [filterOption, setFilterOption] = useState(false);
    const [sortBy, setSortBy] = useState('');
    const isMobile = useMediaQuery('(max-width:600px)');

    const defaultCategories = ['men', 'women', 'kids'];
    const productTypes = ['top', 'bottom', 'top/bottom', 'accessories'];
    const sizes = ['small', 'medium', 'large'];

    useEffect(() => {
        axios.get('http://localhost:5000/api/product/catalogue')
            .then(response => {
                const processedProducts = response.data.map(product => ({
                    ...product,
                    category: defaultCategories.includes(product.category?.toLowerCase()) 
                        ? product.category.toLowerCase() 
                        : 'other'
                }));
                setProducts(processedProducts);
            })
            .catch(error => {
                console.error("There was an error fetching the products!", error);
            });
    }, []);

    const getAppliedFiltersSummary = () => {
        const filters = [];
        if (category) filters.push(`Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`);
        if (selectedTypes.length > 0) filters.push(`Types: ${selectedTypes.join(', ')}`);
        if (selectedSizes.length > 0) filters.push(`Sizes: ${selectedSizes.join(', ').toUpperCase()}`);
        if (priceRange) filters.push(`Price Up to $${priceRange}`);
        return filters.length > 0 ? filters : ['No filters applied'];
    };

    useEffect(() => {
        setShowFilters(getAppliedFiltersSummary());
    }, [category, selectedTypes, selectedSizes, priceRange]);

    const handleRemoveFilter = (filterToRemove) => {
        if (filterToRemove.startsWith('Category:')) {
            setCategory('');
        } else if (filterToRemove.startsWith('Types:')) {
            setSelectedTypes([]);
        } else if (filterToRemove.startsWith('Sizes:')) {
            setSelectedSizes([]);
        } else if (filterToRemove.startsWith('Price Up to $')) {
            setPriceRange('');
        }
    };

  // Helper function to check if measurements fall within size range
const isWithinSizeRange = (product, category, size) => {
  // Early validation checks
  if (!product || !category || !size || !sizeRanges[category]?.[size]) {
    return false;
  }

  const { type, topSizes, bottomSizes } = product;
  
  // Handle accessories (no size filtering needed)
  if (type === 'accessories') {
    return true;
  }

  // Helper function to check if measurements are within range
  const checkMeasurements = (measurements, rangeType) => {
    if (!measurements || !sizeRanges[category][size][rangeType]) {
      return false;
    }

    const rangeForSize = sizeRanges[category][size][rangeType];
    let hasValidMeasurements = false;

    for (const [measurement, value] of Object.entries(measurements)) {
      // Skip if measurement is not provided
      if (!value || !rangeForSize[measurement]) {
        continue;
      }

      hasValidMeasurements = true;
      const range = rangeForSize[measurement];
      
      // If any measurement is outside its range, the item doesn't fit
      if (value < range.min || value > range.max) {
        return false;
      }
    }

    // Return true only if we had at least one valid measurement to check
    return hasValidMeasurements;
  };

  // Check sizes based on product type
  switch (type.toLowerCase()) {
    case 'top':
      return checkMeasurements(topSizes, 'top');
    case 'bottom':
      return checkMeasurements(bottomSizes, 'bottom');
    case 'top/bottom':
      // For full body items, check both top and bottom measurements
      return checkMeasurements(topSizes, 'top') && checkMeasurements(bottomSizes, 'bottom');
    default:
      return false;
  }
};

// Main filtering function
const getFilteredProducts = (products, filters) => {
  const { category, selectedTypes, selectedSizes, priceRange } = filters;
  
  return products.filter(product => {
    // Basic filters
    const categoryMatch = !category || product.category === category;
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type);
    const priceMatch = !priceRange || product.price <= parseInt(priceRange);

    // Size filtering - only apply if sizes are selected and the product has measurements
    const sizeMatch = selectedSizes.length === 0 || 
      selectedSizes.some(size => isWithinSizeRange(product, product.category, size));

    return categoryMatch && typeMatch && sizeMatch && priceMatch;
  });
};
   const filteredProducts = useMemo(() => 
  getFilteredProducts(products, {
    category,
    selectedTypes,
    selectedSizes,
    priceRange
  }), [products, category, selectedTypes, selectedSizes, priceRange]
);
    return (
        <Layout>
            <Box p={5}>
                {/* Mobile Filters Button */}
                {isMobile && (
                    <Button 
                        variant="contained" 
                        onClick={() => setFilterOption(!filterOption)} 
                        sx={{ mb: 2 }} 
                        endIcon={filterOption ? <ExpandMore /> : <KeyboardArrowDown />}
                    >
                        Filters
                    </Button>
                )}

                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                    {/* Filters Panel */}
                    {(isMobile && filterOption) || !isMobile ? (
                        <Box sx={{ width: isMobile ? '100%' : '13%', p: 2, border: !isMobile ? '1px solid #ddd' : 'none', mb: isMobile ? 2 : 0 }}>
                            {/* Category Filter */}
                            <Box sx={{ mb: 2 }}>
                                <Button variant="subtitle1" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)} sx={{ color: "black", width: "100%", borderBottom: "1px outset black", borderLeft: "1px outset black", justifyContent: "space-between", textTransform: "none" }} endIcon={<KeyboardArrowDown />} >

                                    Category
                                </Button>
                                {showCategoryDropdown && (
                                    <Box sx={{ pl: 2, mt: 1 }}>
                                        {defaultCategories.map(cat => (
                                            <Box key={cat} sx={{ mb: 1 }}>
                                                <Button fullWidth onClick={() => setCategory(cat)} sx={{ color: "black", justifyContent: "flex-start", textTransform: "capitalize", backgroundColor: category === cat ? '#f5f5f5' : 'transparent' }} >

                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox 
                                                                checked={category === cat}
                                                                onChange={() => setCategory(category === cat ? '' : cat)}
                                                            />
                                                        }
                                                        label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                    />
                                                </Button>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            {/* Size Filter */}
                          {category && (  <Box sx={{ mb: 2 }}>
                               <Button variant="subtitle1" onClick={() => setShowSizeDropdown(!showSizeDropdown)} sx={{ color: "black", width: "100%", borderBottom: "1px outset black", borderLeft: "1px outset black", justifyContent: "space-between", textTransform: "none" }} endIcon={<KeyboardArrowDown />} >
                                    Size
                                </Button>
                                {showSizeDropdown && (
                                    <Box sx={{ pl: 2, mt: 1 }}>
                                        {sizes.map(size => (
                                            <FormControlLabel
                                                key={size}
                                                control={
                                                    <Checkbox
                                                        checked={selectedSizes.includes(size)}
                                                        onChange={() => {
                                                            setSelectedSizes(prev =>
                                                                prev.includes(size)
                                                                    ? prev.filter(s => s !== size)
                                                                    : [...prev, size]
                                                            );
                                                        }}
                                                    />
                                                }
                                                label={size.toUpperCase()}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>)}

                            {/* Type Filter */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">Product Type</Typography>
                                <Box sx={{ pl: 2 }}>
                                    {productTypes.map(type => (
                                        <FormControlLabel
                                            key={type}
                                            control={
                                                <Checkbox
                                                    checked={selectedTypes.includes(type)}
                                                    onChange={() => {
                                                        setSelectedTypes(prev =>
                                                            prev.includes(type)
                                                                ? prev.filter(t => t !== type)
                                                                : [...prev, type]
                                                        );
                                                    }}
                                                />
                                            }
                                            label={type.charAt(0).toUpperCase() + type.slice(1)}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {/* Price Range Filter */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">Price Range</Typography>
                                <Box sx={{ pl: 2 }}>
                                    {[100, 200, 300].map(price => (
                                        <FormControlLabel
                                            key={price}
                                            control={
                                                <Checkbox
                                                    checked={priceRange === price.toString()}
                                                    onChange={() => setPriceRange(priceRange === price.toString() ? '' : price.toString())}
                                                />
                                            }
                                            label={`Up to $${price}`}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    ) : null}

                    {/* Rest of the component remains the same... */}
                    {/* Product Grid Section */}
                    <Box sx={{ width: isMobile ? '100%' : '75%', p: 2 }}>
                        {/* Sort and Count */}
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="body2">
                                Showing {filteredProducts.length} of {products.length} items
                            </Typography>
                            <FormControl sx={{ minWidth: 150, maxWidth: 300 }}>
                                <InputLabel>Sort By</InputLabel>
                                <Select  value={sortBy}     onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                                    <MenuItem value="newest">Newest First</MenuItem>
                                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Applied Filters */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1">
                                Applied Filters:
                                {showFilters.map((filter, index) => (
                                  <Box key={index} component="span" sx={{ display: 'inline-flex', alignItems: 'center', border: '1px solid', borderRadius: '30px', padding: '4px 8px', marginLeft: '8px', backgroundColor: '#f1f1f1' }} >

                                        {filter}
                                       <IconButton size="small" onClick={() => handleRemoveFilter(filter)} sx={{ ml: 1 }} >

                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Typography>
                        </Box>

                        {/* Product Grid */}
                        <Grid container spacing={2}>
                            {filteredProducts.map(product => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                                    <Link
                                        href={`/product/${product._id}`}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <Card>
                                            <CardMedia sx={{ height: 200, width: "100%" }}>
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    style={{ width: '100%', height: '100%', objectFit: "contain" }}
                                                />
                                            </CardMedia>
                                            <CardContent>
                                                <Typography textAlign="start" variant="h6">{product.name}</Typography>
                                                <Typography variant="body1" color="text.secondary">${product.price}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                                                </Typography>
                                                {product.owner && (
                                                    <Typography textAlign="end" variant="body2" color="text.secondary">
                                                        {product.owner.name}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default CataloguePage;