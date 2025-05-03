import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Button, Checkbox, Link, FormControlLabel, useMediaQuery, Card, CardMedia, CardContent, FormControl, Select, InputLabel, MenuItem, IconButton, Skeleton } from "@mui/material";
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import Layout from "../Layout/layout";
import axios from 'axios';
import sizeRanges from "../Utils/sizeRange";
import SkeletonLoader from "../Utils/skeletonLoader";
// Lazy load less critical components
const SizeChartMUI = React.lazy(() => import("./sizechart"));
const FilterDrawer = React.lazy(() => import("./filter"));


// Replace your current ProductCardSkeleton with:
const ProductCardSkeleton = () => (
  <Card>
    <SkeletonLoader height="200px" />
    <CardContent>
      <SkeletonLoader.Text lines={1} width="80%" />
      <SkeletonLoader.Text lines={1} width="40%" />
      <SkeletonLoader.Text lines={1} width="60%" />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SkeletonLoader width="30%" height="20px" />
      </Box>
    </CardContent>
  </Card>
);


// Replace your current FiltersSkeleton with:
const FiltersSkeleton = () => (
  <Box sx={{ width: '100%', p: 2 }}>
    <SkeletonLoader height="48px" style={{ marginBottom: '16px' }} />
    <SkeletonLoader height="150px" style={{ marginBottom: '16px' }} />
    <SkeletonLoader height="150px" style={{ marginBottom: '16px' }} />
    <SkeletonLoader height="150px" />
  </Box>
);

const CataloguePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imagesLoaded, setImagesLoaded] = useState({});
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const defaultCategories = ['men', 'women', 'kids'];
    const productTypes = ['top', 'bottom', 'top/bottom', 'accessories'];
    const sizes = ['small', 'medium', 'large'];


    const handleImageLoad = (productId) => {
        setImagesLoaded(prev => ({
            ...prev,
            [productId]: true
        }));
    };

     useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/catalogue`);
                const processedProducts = response.data.map(product => ({
                    ...product,
                    category: defaultCategories.includes(product.category?.toLowerCase()) 
                        ? product.category.toLowerCase() 
                        : 'other'
                }));
                setProducts(processedProducts);
            } catch (error) {
                console.error("There was an error fetching the products!", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const getAppliedFiltersSummary = () => {
        const filters = [];
        if (category) filters.push(`Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`);
        if (selectedTypes.length > 0) filters.push(`Types: ${selectedTypes.join(', ')}`);
        if (selectedSizes.length > 0) filters.push(`Sizes: ${selectedSizes.join(', ').toUpperCase()}`);
        if (priceRange) filters.push(`Price Up to $${priceRange}`);
        if (searchQuery) filters.push(`Search: "${searchQuery}"`);
        return filters.length > 0 ? filters : ['No filters applied'];
    };


  useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        if (searchParam) {
            setSearchQuery(searchParam);
        } else {
            setSearchQuery('');
        }
    }, [location.search]);

    useEffect(() => {
        setShowFilters(getAppliedFiltersSummary());
    }, [category, selectedTypes, selectedSizes, priceRange, searchQuery]);

    const handleRemoveFilter = (filterToRemove) => {
        if (filterToRemove.startsWith('Category:')) {
            setCategory('');
        } else if (filterToRemove.startsWith('Types:')) {
            setSelectedTypes([]);
        } else if (filterToRemove.startsWith('Sizes:')) {
            setSelectedSizes([]);
        } else if (filterToRemove.startsWith('Price Up to Rs.')) {
            setPriceRange('');
        }else if (filterToRemove.startsWith('Search:')) {
          setSearchQuery('');
            const currentParams = new URLSearchParams(location.search);
            currentParams.delete('search');
            navigate(`/c?${currentParams.toString()}`, { replace: true });
}
    };
    const getSortedProducts = (products, sortBy) => {
  // Create a new array to avoid mutating the original
  const sortedProducts = [...products];
  
  switch(sortBy) {
    case 'newest':
      // Sort by creation date (assuming products have a createdAt field)
      return sortedProducts.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    case 'price-high':
      // Sort by price high to low
      return sortedProducts.sort((a, b) => b.price - a.price);
    case 'price-low':
      // Sort by price low to high
      return sortedProducts.sort((a, b) => a.price - b.price);
    default:
      // Default case, return unsorted
      return sortedProducts;
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
    
    // Search filtering - new
    const searchMatch = !searchQuery || 
      product.name.toLowerCase() === searchQuery.toLowerCase()||

      product.name.toLowerCase().includes(searchQuery.toLowerCase()) 

    return categoryMatch && typeMatch && sizeMatch && priceMatch  && searchMatch;
  });
};
   const filteredProducts = useMemo(() => {
       const filtered = getFilteredProducts(products, {
    category,
    selectedTypes,
    selectedSizes,
    priceRange
    
  });
   return getSortedProducts(filtered, sortBy);}
  , [products, category, selectedTypes, selectedSizes, priceRange, sortBy, searchQuery]
);



    return (
        <Layout>
            <Box p={5} >
                {/* Mobile Filters Button */}
                  <Suspense fallback={null}>
                               <FilterDrawer
                    isOpen={isFilterOpen}
                    onClose={setIsFilterOpen}
                    categories={defaultCategories}
                    sizes={sizes}
                    productTypes={productTypes}
                    priceRanges={[100, 200, 300]}
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


                <Box marginTop={4} sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
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
                       <Box  display="flex"   flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'flex-start' : 'center'}   gap={isMobile ? 2 : 0}  mb={2}>
                          <Typography      variant="body2"    sx={{   mb: isMobile ? 1 : 0, width: isMobile ? '100%' : 'auto'  }} >
                                 Showing {filteredProducts.length} of {products.length} items
                         </Typography>
        
                        <Box   display="flex"   alignItems="center"  gap={1}   ml={isMobile ? 0 : 'auto'}  width={isMobile ? '100%' : 'auto'} >
                           <Suspense fallback={<Skeleton variant="rectangular" width={40} height={40} />}>
                                    <SizeChartMUI />
                                </Suspense>
                            <FormControl sx={{    minWidth: isMobile ? '50%' : 200,  maxWidth: 300   }} >
                                <InputLabel>Sort By</InputLabel>
                                    <Select  value={sortBy}  onChange={(e) => setSortBy(e.target.value)}   label="Sort By" >
                                        <MenuItem value="newest">Newest First</MenuItem>
                                      <MenuItem value="price-high">Price: High to Low</MenuItem>
                                       <MenuItem value="price-low">Price: Low to High</MenuItem>
                                    </Select>
                           </FormControl>
                         </Box>
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




                         

   {loading ? (
    // Show skeletons while loading
    Array(8).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <ProductCardSkeleton />
      </Grid>
    ))
  ) : (
    // Show actual products when loaded

                            filteredProducts.map(product => (
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
                                                <Typography variant="body1" color="text.secondary">Rs.{product.price}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                                                </Typography>
                                               
                                                    <Typography textAlign="end" variant="body2" color="text.secondary">
                                                        {product.owner.username || 'Hareem'}
                                                    </Typography>
                                                
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </Grid>
                            )))}
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default CataloguePage;