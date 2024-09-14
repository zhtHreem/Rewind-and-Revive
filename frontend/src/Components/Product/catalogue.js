import React, { useState } from "react";
import { Box, Grid, Paper, Typography, Button, Checkbox,Link, FormControlLabel, useMediaQuery, Card, CardMedia, CardContent } from "@mui/material";
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import ExpandMore from '@mui/icons-material/ExpandMore';

const CataloguePage = () => {
    const [category, setCategory] = useState('');
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [priceRange, setPriceRange] = useState('');
    const [size, setSize] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const isMobile = useMediaQuery('(max-width:600px)');

    // Mock products data
    const products = [
        { id: 1, name: "Elegant Dress", image: require('./images/1.jpg'), price: 120, category: "women", subcategory: "dresses", size: "M" },
        { id: 2, name: "Casual T-Shirt", image: require('./images/2.jpg'), price: 40, category: "women", subcategory: "tops", size: "S" },
        { id: 3, name: "Stylish Jeans", image: require('./images/3.jpg'), price: 80, category: "women", subcategory: "pants", size: "L" },
        { id: 4, name: "Formal Suit", image: require('./images/5.jpg'), price: 250, category: "men", subcategory: "pants", size: "L" },
        { id: 5, name: "Sporty Jacket", image: require('./images/1.jpg'), price: 100, category: "men", subcategory: "shirt", size: "M" },
        { id: 6, name: "Trendy Skirt", image: "https://via.placeholder.com/150", price: 90, category: "women", subcategory: "skirts", size: "S" },
        { id: 7, name: "Classic Sweater", image: "https://via.placeholder.com/150", price: 70, category: "women", subcategory: "tops", size: "M" },
        { id: 8, name: "Denim Jacket", image: "https://via.placeholder.com/150", price: 110, category: "men", size: "M" },
        { id: 9, name: "Graphic Tee", image: "https://via.placeholder.com/150", price: 45, category: "kids", size: "S" },
        { id: 10, name: "Comfortable Joggers", image: "https://via.placeholder.com/150", price: 60, category: "kids", size: "M" }
    ];

    const uniqueCategories = [...new Set(products.map(p => p.category))];
    const getUniqueSubcategories = (selectedCategory) => {
        return [...new Set(products.filter(p => p.category === selectedCategory && p.subcategory).map(p => p.subcategory))];
    };

    const getAppliedFiltersSummary = () => {
        const filters = [];
        if (category) filters.push(`Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`);
        if (selectedSubcategories.length > 0) filters.push(`Subcategories: ${selectedSubcategories.map(subcat => subcat.charAt(0).toUpperCase() + subcat.slice(1)).join(', ')}`);
        if (priceRange) filters.push(`Price Up to $${priceRange}`);
        if (size) filters.push(`Size: ${size.toUpperCase()}`);
        return filters.length > 0 ? filters.join(' | ') : 'No filters applied';
    };

    return (
        <Box p={5}>
            {/* Filters Button (Mobile View) */}
            {isMobile && (
                <Button
                    variant="contained"
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ mb: 2 }}
                    endIcon={showFilters ? <ExpandMore /> : <KeyboardArrowDown />}
                >
                    Filters
                </Button>
            )}

            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row'}}>
                {/* Filters Panel (Mobile View: Toggleable) */}
                {(isMobile && showFilters) || !isMobile ? (
                    <Box sx={{ width: isMobile ? '100%' : '13%', p: 2, border: !isMobile ? '1px solid #ddd' : 'none', mb: isMobile ? 2 : 0 }}>
                        {/*<Typography variant="h6">Filters</Typography>*/}

                        {/* Category Filter */}
                        <Box sx={{ mb: 2 }}>
                            <Button
                                variant="subtitle1"
                                onClick={() => setCategory(category ? '' : 'category')}
                                sx={{ color: "black", width: "100%", borderBottom: "1px outset black", borderLeft: "1px outset black" }}
                                endIcon={<KeyboardArrowDown />}
                            >
                                Category
                            </Button>
                            {category && (
                                <Box sx={{ pl: 2 }}>
                                    {uniqueCategories.map(cat => (
                                        <Box key={cat} sx={{ mb: 2 }}>
                                            <Button
                                                fullWidth
                                                onClick={() => setCategory(cat)}
                                                sx={{ color: "black", width: "100%", borderBottom: "1px outset black", }}
                                                endIcon={<KeyboardArrowDown />}
                                            >
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </Button>
                                            {category === cat && (
                                                <Box sx={{ pl: 2 }}>
                                                    {getUniqueSubcategories(cat).map(subcat => (
                                                        <FormControlLabel
                                                            key={subcat}
                                                            control={
                                                                <Checkbox
                                                                    checked={selectedSubcategories.includes(subcat)}
                                                                    onChange={() => {
                                                                        setSelectedSubcategories(prev =>
                                                                            prev.includes(subcat)
                                                                                ? prev.filter(item => item !== subcat)
                                                                                : [...prev, subcat]
                                                                        );
                                                                    }}
                                                                />
                                                            }
                                                            label={subcat.charAt(0).toUpperCase() + subcat.slice(1)}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        {/* Price Range Filter */}
                        <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle1">
        Price Range
    </Typography>
    <Box sx={{ pl: 2 }}>
        <FormControlLabel
            control={
                <Checkbox
                    checked={priceRange === '100'}
                    onChange={() => setPriceRange(priceRange === '100' ? '' : '100')}
                />
            }
            label="Up to $100"
        />
        <FormControlLabel
            control={
                <Checkbox
                    checked={priceRange === '200'}
                    onChange={() => setPriceRange(priceRange === '200' ? '' : '200')}
                />
            }
            label="Up to $200"
        />
        <FormControlLabel
            control={
                <Checkbox
                    checked={priceRange === '300'}
                    onChange={() => setPriceRange(priceRange === '300' ? '' : '300')}
                />
            }
            label="Up to $300"
        />
    </Box>
</Box>


                        {/* Size Filter */}
                        <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle1">
        Size
    </Typography>
    <Box sx={{ pl: 2 }}>
        <FormControlLabel
            control={
                <Checkbox  checked={size === 'S'} onChange={() => setSize(size === 'S' ? '' : 'S')}/>
            }
            label="Small"
        />
        <FormControlLabel
            control={
                <Checkbox checked={size === 'M'} onChange={() => setSize(size === 'M' ? '' : 'M')}/>
            }
            label="Medium"
        />
        <FormControlLabel
            control={
                <Checkbox checked={size === 'L'} onChange={() => setSize(size === 'L' ? '' : 'L')} />
            }
            label="Large"
        />
    </Box>
</Box>

                    </Box>
                ) : null}

                {/* Product Grid with Filter Summary */}
                <Box sx={{ width: isMobile ? '100%' : '75%', p: 2 }}>
                    {/* Filter Summary */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Applied Filters: {getAppliedFiltersSummary()}</Typography>
                    </Box>

                    {/* Product Grid */}
                    <Grid container spacing={2}>
                        {products
                            .filter(product => (
                                (!category || product.category === category) &&
                                (selectedSubcategories.length === 0 || selectedSubcategories.includes(product.subcategory)) &&
                                (!priceRange || product.price <= parseInt(priceRange)) &&
                                (!size || product.size === size)
                            ))
                            .map(product => (
                                
                                <Grid  item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                   <Link
                            href="/product" // Adjust the URL based on your routing setup
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >

                                    <Card >
                                        <CardMedia sx={{height:200,width:"100%"}}>
                                           
                                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%',objectFit:"contain" }} />
                                         </CardMedia>
                                        <CardContent>
                                            
                                            <Typography textAlign={"start"} variant="h6">{product.name}</Typography>
                                            <Typography variant="body1" color="text.secondary">${product.price}</Typography>
                                            <Typography textAlign={"end"}variant="body2" color="text.secondary">Hareem</Typography>
                                        </CardContent>
                                     </Card> 
                                        
                                     </Link>
                                </Grid>
                              
                            ))}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default CataloguePage;
