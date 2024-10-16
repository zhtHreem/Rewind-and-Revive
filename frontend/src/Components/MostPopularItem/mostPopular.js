import React from 'react';
import { Box, Typography, Grid, Link,Card,CardHeader,CardMedia,CardContent } from '@mui/material';

const PopularFabricsSection = () => {
  // Sample fabric images (replace with actual URLs)
  const fabricImages = [
    require('./images/desiwhitekurta.webp'),
    require('./images/navymenshirt.jpg'),
    require('./images/blackmen.avif'),
    require('./images/brown frock.jpg'),
    require('./images/offwhitegownwomen.webp'),
    require('./images/maninblack.jpeg')

  ];


  const products = [
        { id: 1, name: "White Kurti", image: require('./images/desiwhitekurta.webp'), price: 120, category: "women", subcategory: "dresses", size: "M" },
        { id: 2, name: "Navy Blue Shirt", image: require('./images/navymenshirt.jpg'), price: 40, category: "women", subcategory: "tops", size: "S" },
        { id: 3, name: "Black Shirt", image: require('./images/blackmen.avif'), price: 80, category: "women", subcategory: "pants", size: "L" },
        { id: 4, name: "Brown Frock", image: require('./images/brown frock.jpg'), price: 250, category: "men", subcategory: "pants", size: "L" },
        { id: 5, name: "Offwhite-Dress", image: require('./images/offwhitegownwomen.webp'), price: 100, category: "men", subcategory: "shirt", size: "M" },
        { id: 6, name: "Black Outfit", image: require("./images/maninblack.jpeg"), price: 90, category: "women", subcategory: "skirts", size: "S" },
      
    ];


  return (
    <Box p={12}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Most Popular Fabrics
        </Typography>
        <Link href="#" underline="hover" sx={{ color: 'black', fontSize: '14px' }}>
          View All
        </Link>
      </Box>

      {/* Grid of images */}
     
            <Grid container spacing={2}>
                        {products.map((product, index) => (
                                <Grid  item xs={12} sm={6} md={4} lg={4} key={product.id}>
                                   <Link href="/product" // Adjust the URL based on your routing setup
                            style={{ textDecoration: 'none', color: 'inherit' }}  >

                                    <Card >
                                        <CardMedia sx={{height:300,width:"100%"}}>
                                           
                                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%',objectFit:"cover" }} />
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
  );
};

export default PopularFabricsSection;
