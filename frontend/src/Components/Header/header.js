import React from 'react';
import { Box, Button, List, ListItem, ListItemIcon,AppBar, Toolbar,  ListItemText, IconButton,CardMedia, Stack, Grid, Typography, Card } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import AddSharpIcon from '@mui/icons-material/AddSharp';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/navbar';
import MenuIcon from '@mui/icons-material/Menu';
import 'swiper/css';
import { Navigation,Pagination } from 'swiper/modules'; // Import Swiper modules
import Swipe from './Swiper/pagination';
import { useLogin } from '../Login/logincontext';
import Login from '../Login/login';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: 'hsla(353, 8%, 40%, 1)', // Brownish
    margin: 0,
    padding: 0,
  },
  p: {
    color: '#fff',
    fontFamily: 'Avenir Next, Helvetica Neue, Helvetica, Tahoma, sans-serif',
    fontSize: { xs: '2em', sm: '3em', md: '5em', lg: '8em' },
    fontWeight: 700,
    letterSpacing: 'calc(300em / 1000)',
    '& span': {
      display: 'inline-block',
      position: 'relative',
      transformStyle: 'preserve-3d',
      perspective: '500px',
      WebkitFontSmoothing: 'antialiased',
      '&:before, &:after': {
        display: 'none', // Hidden initially
        position: 'absolute',
        top: 0,
        left: '-1px',
        transformOrigin: 'left top',
        transition: 'all ease-out .3s', // Animation duration
        content: 'attr(data-text)',
      },
      '&:before': {
        zIndex: 1,
        color: 'rgba(0, 0, 0, 0.2)',
        transform: 'scale(1.1, 1) skew(0deg, -20deg)', // Initial shadow skew
      },
      '&:after': {
        zIndex: 2,
        color: 'hsla(259, 36%, 47%, 1)', // Purple background
        textShadow: '-1px 0 1px hsla(259, 36%, 47%, 1), 1px 0 1px rgba(0, 0, 0, 0.8)',
        transform: 'rotateY(-40deg)', // Initial skew
      },
      '&:hover': {
        '&:before': {
          transform: 'scale(1.1, 1) skew(0deg, -5deg)', // Hover shadow skew
        },
        '&:after': {
          transform: 'rotateY(-10deg)', // Hover skew
        },
      },
    },
  },
};
function Header() {
  const { isLoginOpen, setLoginOpen } = useLogin();
  return (
    <>
    
    <Box marginLeft={4}  p={{ xs: 1, md: 5 }} >
     {isLoginOpen && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}>
          <Login setLogin={setLoginOpen} />
        </Box>
      )}
      <Grid container spacing={{ xs: 3, md: 8 }}>
        <Grid item xs={12} md={5}>
          <Typography variant='h2' fontFamily={"'Times New Roman', serif"}fontSize={{xs: '2rem', sm: '2.5rem',   md: '3rem',lg: '3.5rem',  }}>
            Rewind and Revive
          </Typography>
          <Typography variant='body2'  fontSize={{  xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', }} >
            Discover sustainable fashion at Rewind & Revive, the ultimate online thrift store for unique, second-hand treasures
          </Typography>
          <Stack direction="row" py={2}>
            <Button fontSize={{ xs: "0.75rem" }} sx={{ color: "white", backgroundColor: "#B3A398",'&:hover': { backgroundColor: "#576F72" }  }}>
              Explore More
            </Button>
          </Stack>
        </Grid>

        {/* Nested Grid Container */}
        <Grid container spacing={10}  xs={12} md={7}  >
          <Grid item xs={6} md={6}  >

             <Box marginLeft={3}  marginTop={10} sx={{ minWidth:100,width: {xs: '100%',sm:300}, height:{xs:400,md:470}, background: 'linear-gradient(45deg,#A6B37D ,#CCD3CA)',   border: '2px solid #fffefa', transform: 'rotate(5deg)', display: 'flex',   alignItems: 'center',   justifyContent: 'center', position:"relative", }} >
               <Card>
                 <CardMedia component="img" image={require("./images/r.jpg")}  alt="Description"  sx={{width:"100%",height:"100%",position:"absolute",transform: 'rotate(355deg)',top:5,left:-5}} />
                </Card>
             </Box>
          </Grid>

          <Grid item xs={6} md={6} justifyContent={"space-around"} marginTop={10} >

            <Stack direction="row" spacing={2} >
              <IconButton  sx={{ border: '2px solid #000', borderRadius: '1' }}>
                <AddSharpIcon  sx={{ color: "orangered",fontSize:{ xs: "0.75rem" } }} />
              </IconButton>
              <Typography  component={Link} variant="h5" fontSize={{ xs: "0.75rem",md: '1rem',
              lg: '1.125rem', }} fontFamily={"'Times New Roman', serif"} sx={{color:"black"}}>
                Explore our curated collection of pre-loved treasures
              </Typography>
            </Stack>


            <Box  marginTop={5} p={{xs:1,sm:2}}sx={{ minWidth:100,width: {xs: '100%',sm:250},height: {xs:300,sm:400},  background: 'linear-gradient(135deg, #F5E8DD 50%,  #867070 50%)',  border: '2px solid #fffefa', }}>
                  <CardMedia component="img"sx={{ height: '100%', width: '100%' }}image={require("./images/a.jpg")} alt="Description" />
            </Box>
          </Grid>
        </Grid>

        {/* "What Makes Us Pro?" Section Moves Below on Small Screens */}
        <Grid item xs={12}  sx={{ position: {xs:"none",md:'absolute'},zIndex: 1,bottom:60 }}>
          <Stack py={2}>
            <Typography variant="h5" fontFamily={"'Times New Roman', serif"} fontSize={{  xs: '1.5rem', sm: '1.75rem',md: '2rem',  lg: '2.25rem',}} >
                 What Makes Us Pro?
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><RadioButtonCheckedIcon sx={{ color: "#B3A398" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: "body2" }}>Quality second-hand fashion</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><RadioButtonCheckedIcon sx={{ color: "#C1A3A3" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: "body2" }}>Affordable sustainable styles</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><RadioButtonCheckedIcon sx={{ color: "#618264" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: "body2" }}>Pre-loved designer items</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><RadioButtonCheckedIcon sx={{ color: "#7C9D96" }} /></ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: "body2" }}>Fashion-forward sustainability</ListItemText>
              </ListItem>
            </List>
          </Stack>
        </Grid>
      </Grid>
      
      <Grid item xs={12}>
         <Swipe/>
         </Grid>
    </Box>
    </>
  );
}

export default Header;
