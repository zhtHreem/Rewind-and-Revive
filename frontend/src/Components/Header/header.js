import React from 'react';
import { Box, Button, List, ListItem, ListItemIcon, ListItemText, IconButton,CardMedia, Stack, Grid, Typography, Card } from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import AddSharpIcon from '@mui/icons-material/AddSharp';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/navbar';

function DiagonalBox() {
  return (
    <>
    <Navbar/>
    <Box p={{ xs: 1, md: 8 }} sx={{ position: 'relative' }}>
      <Grid container spacing={{ xs: 3, md: 8 }}>
        <Grid item xs={12} md={5}>
          <Typography
            variant='h2'
            fontFamily={"'Times New Roman', serif"}
            fontSize={{
              xs: '2rem',
              sm: '2.5rem',
              md: '3rem',
              lg: '3.5rem',
            }}
          >
            Rewind and Revive
          </Typography>
          <Typography
            variant='body2'
            fontSize={{
              xs: '0.75rem',
              sm: '0.875rem',
              md: '1rem',
              lg: '1.125rem',
            }}
          >
            Discover sustainable fashion at Rewind & Revive, the ultimate online thrift store for unique, second-hand treasures
          </Typography>
          <Stack direction="row" py={2}>
            <Button fontSize={{ xs: "0.75rem" }} sx={{ color: "white", backgroundColor: "orangered" }}>
              Explore More
            </Button>
          </Stack>
        </Grid>

        {/* Nested Grid Container */}
        <Grid container spacing={10} marginTop={-9} item xs={12} md={7} >
          <Grid item xs={6} md={6}  >

          <Box
      
      sx={{
        width: '100%',
        minHeight: {lg:'81%',xl:'100%'}, // Ensure the Box can grow with content
        
        background: 'linear-gradient(45deg, #ff5733, #ffd633)',
        border: '2px solid #fffefa',
        transform: 'rotate(5deg)',
        display: 'flex',
        alignItems: 'center', // Center items vertically if needed
        justifyContent: 'center', // Center items horizontally if needed
        position:"relative"
      }}
    >
      <Card>
        <CardMedia
          component="img"
          height="auto" // Allow height to be auto-adjusted
          image={require("./images/pink.jpg")}
          alt="Description"
          sx={{position:"absolute",transform: 'rotate(355deg)',top:5,left:-5}}
        />
      </Card>
    </Box>
          </Grid>

          <Grid item xs={6} md={6} justifyContent={"space-between"}  >
            <Stack direction="row" spacing={2}>
              <IconButton  sx={{ border: '2px solid #000', borderRadius: '1' }}>
                <AddSharpIcon  sx={{ color: "orangered",fontSize:{ xs: "0.75rem" } }} />
              </IconButton>
              <Typography component={Link} variant="h5" fontSize={{ xs: "0.75rem",md: '1rem',
              lg: '1.125rem', }} fontFamily={"'Times New Roman', serif"}>
                Explore our curated collection of pre-loved treasures
              </Typography>
            </Stack>
            <Box
              marginTop={4}
              p={2}
              sx={{
                width: 'auto',
                
                background: 'linear-gradient(135deg, #ff5733 50%, #ffd633 50%)',
                border: '2px solid #fffefa',
              }}
            >
                
        <CardMedia
          component="img"
          sx={{ height: '425px', width: 'auto' }}
          // Allow height to be auto-adjusted
          image={require("./images/orange.jpg")}
          alt="Description"
        
        />
      
            </Box>
          </Grid>
        </Grid>

        {/* "What Makes Us Pro?" Section Moves Below on Small Screens */}
        <Grid item xs={6} md={12} sx={{ position: {xs:"none",md:'absolute'},zIndex: 10,bottom:30 }}>
          <Stack py={2}>
            <Typography
              variant="h5"
              fontFamily={"'Times New Roman', serif"}
              fontSize={{
                xs: '1.5rem',
                sm: '1.75rem',
                md: '2rem',
                lg: '2.25rem',
              }}
            >
              What Makes Us Pro?
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><RadioButtonCheckedIcon sx={{ color: "orangered" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: "body2" }}>Quality second-hand fashion</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><RadioButtonCheckedIcon sx={{ color: "orangered" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: "body2" }}>Affordable sustainable styles</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><RadioButtonCheckedIcon sx={{ color: "orangered" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: "body2" }}>Pre-loved designer items</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><RadioButtonCheckedIcon sx={{ color: "orangered" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: "body2" }}>Fashion-forward sustainability</ListItemText>
              </ListItem>
            </List>
          </Stack>
        </Grid>
      </Grid>
    </Box>
    </>
  );
}

export default DiagonalBox;
