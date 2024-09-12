import React, { useState } from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper} from '@mui/material';

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Layout from '../Layout/layout';

const item = {
    name: "Product name",
    price: "200",
    description: "This is the product description.",
    sizeDetail: [
      { label: 'Waist', value: '32 inches' },
      { label: 'Arm Length', value: '25 inches' },
      { label: 'Hips', value: '40 inches' },
      { label: 'Shoulder Width', value: '18 inches' },
      { label: 'Bust/Chest', value: '36 inches' },
      { label: 'Neck Circumference', value: '15 inches' }
    ],
    shippingAndReturn: "Shipping and return policy details."
  };

const ProductPage = () => {
    const [ description,setDescription]=useState(false);
    const [size,setSize]=useState(false);
    const [shipping,setShipping]=useState(false);
  const images = [
    require('./images/p1.jpg'),
    require('./images/pink.jpg'),
    require('./images/p1.jpg'),
    require('./images/orange.jpg'),
    require('./images/p1.jpg'),
  ];

  const [mainImage, setMainImage] = useState(images[0]);

  const handleImageClick = (image) => {
    setMainImage(image);
  };

  return (
    <Layout>
    <Box sx={{ flexGrow: 1, padding: 6 }}>
      <Grid container spacing={2}>
        {/* Main Image and Thumbnails */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2} direction="column">
            {/* Main Image */}
            <Grid item>
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ width:"100%",height: { xs: 300, md: 600,lg:700 },border: '1px solid #ccc', padding: 2,  backgroundColor: '#f9f9f9', }}  >
                <Box  component="img" src={mainImage} alt="Main Product" sx={{ width: '100%', height: '100%',objectFit:"contain" }}/>
                </Box>
            </Grid>

            {/* Thumbnails */}
            <Grid item>
              <Grid container spacing={1}>
                {images.map((image, index) => (
                  <Grid item xs={3} key={index}>
                    <Box
                      component="img" src={image}
                      alt={`Thumbnail ${index + 1}`}
                      onClick={() => handleImageClick(image)}
                      sx={{ width: "100%",height:100,objectFit:"contain" ,cursor: 'pointer', border: mainImage === image ? '2px solid #007bff' : '2px solid transparent',transition: 'border-color 0.3s ease','&:hover': { borderColor: '#0056b3', },}}/>
                  </Grid>
                ))}
              </Grid>
            </Grid>

          </Grid>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6} >
          <Box sx={{ px:6,display: 'flex',flexDirection:"column",gap:5 }} >
            <Typography variant="h2" sx={{ marginBottom: 1 }}>
              {item.name}
            </Typography>
            <Typography variant="h4" sx={{ marginBottom: 2 }}>
              ${item.price}
            </Typography>
            <Box sx={{display: 'flex',gap: 2,}}>
            <Button variant="contained" size="large" sx={{width:{xs: '100%'},backgroundColor:"black",'&:hover': { backgroundColor: "#6b0407",},}}>Add to Cart</Button>
            <Button variant="contained" size="large" sx={{width:{xs: '100%'},backgroundColor:"#6b0407",'&:hover': { backgroundColor: "black",},}}>Buy Now</Button>
            </Box>  

            {/* Size Detail Section */}
            <Button onClick={() => { setSize(prev => !prev); }} sx={{ color: "black", width: "100%", borderBottom: "1px outset black", borderLeft: "1px outset black", }} endIcon={<KeyboardArrowDown />}>Size Detail</Button>
            {size && (
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    {item.sizeDetail.map((size, index) => (
                      <TableRow key={index}>
                        <TableCell>{size.label}</TableCell>
                        <TableCell>{size.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
              <Button  onClick={() => {setShipping(prev => !prev);}} sx={{color:"black",width:"100%", borderBottom: "1px outset black",borderLeft: "1px outset black", }}  endIcon={<KeyboardArrowDown />}>Shipping and return</Button>
            { shipping  && (
                 <Typography>{item.shippingAndReturn}</Typography>
            )}  
              <Button  onClick={() => {setDescription(prev => !prev);}} sx={{color:"black",width:"100%", borderBottom: "1px outset black",borderLeft: "1px outset black", }}  endIcon={<KeyboardArrowDown />}>Description</Button>
            { description && (
                 <Typography>{item.description}</Typography>
            )}  



          </Box>
        </Grid>
        
      </Grid>
    </Box>
    </Layout>
  );
};

export default ProductPage;
