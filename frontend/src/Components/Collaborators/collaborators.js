import React from 'react';
import { Box, Typography, Grid, Link, Card, CardMedia, CardContent } from '@mui/material';
import Layout from '../Layout/layout';
import { grey } from '@mui/material/colors';
const CollaboratorsSection = () => {
  // Sample collaborators data
  const collaborators = [
    {
      id: 1,
      name: "Fashion Designer A",
      image: require('./images/Profile.png'), // Replace with the actual path to the image
      description: "Renowned for elegant and contemporary designs.",
      category: "fashion",
      subcategory: "designers",
    },
    {
      id: 2,
      name: "Fashion Brand B",
      image: require('./images/Profile.png'), // Replace with the actual path to the image
      description: "Known for sustainable and eco-friendly clothing.",
      category: "fashion",
      subcategory: "brands",
    },
    {
      id: 3,
      name: "Stylist C",
      image: require('./images/Profile.png'), // Replace with the actual path to the image
      description: "Expert in personal styling and wardrobe consulting.",
      category: "fashion",
      subcategory: "stylists",
    },
    {
      id: 4,
      name: "Influencer D",
      image: require('./images/Profile.png'), // Replace with the actual path to the image
      description: "Social media influencer with a passion for fashion.",
      category: "fashion",
      subcategory: "influencers",
    },
    {
      id: 5,
      name: "Brand E",
      image: require('./images/Profile.png'), // Replace with the actual path to the image
      description: "A brand focused on luxury and style.",
      category: "fashion",
      subcategory: "luxury",
    },
    {
      id: 6,
      name: "Fashion Photographer F",
      image: require('./images/Profile.png'), // Replace with the actual path to the image
      description: "Specializing in fashion photography and editorial shoots.",
      category: "fashion",
      subcategory: "photographers",
    },
  ];

  return (
    <>
     <Layout>

    
    <Box p={13}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Meet Our Collaborators
        </Typography>
        <Link href="#" underline="hover" sx={{ color: 'black', fontSize: '14px' }}>
          View All
        </Link>
      </Box>

      {/* Collaborator Grid */}
      <Grid container spacing={5}>
        {collaborators.map((collaborator) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={collaborator.id}>
            <Link
              href="/collaborator" // Adjust the URL based on your routing setup
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Card sx={{width:300,backgroundColor:'beige' }}>
                <CardMedia sx={{ height: 200, width: "100%",}}>
                  <img
                    src={collaborator.image}
                    alt={collaborator.name}
                    style={{ width: '100%', height: '100%', objectFit: "contain" }}
                  />
                </CardMedia>
                <CardContent sx={{backgroundColor:"black"}}>
                  <Typography textAlign={"start"} variant="h6" sx={{color:"white"}}>{collaborator.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{color:"white"}}>{collaborator.description}</Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
     </Layout>
    </>
  );
};

export default CollaboratorsSection;
