import React, { useState } from "react";

import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Stack, Link, Box, IconButton, Typography, Button, Drawer, Divider,Paper } from "@mui/material";
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { useLogin } from "../Login/logincontext";
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddCart from "../ShoppingCart/AddCart";
import AddIcon from '@mui/icons-material/Add';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DiscountIcon from '@mui/icons-material/Discount';
 // Sample notifications data
  const notificationsList = [
    {
      id: 1,
      icon: <CheckCircleOutlineIcon color="success" />,
      title: "Order Confirmed",
      description: "Your order #1234 has been confirmed and is being processed.",
      time: "2 mins ago"
    },
    {
      id: 2,
      icon: <LocalShippingIcon color="primary" />,
      title: "Shipping Update",
      description: "Your package is out for delivery.",
      time: "1 hour ago"
    },
    {
      id: 3,
      icon: <DiscountIcon color="secondary" />,
      title: "New Discount",
      description: "Get 20% off on summer collection!",
      time: "3 hours ago"
    },
    {
      id: 4,
      icon: <CheckCircleOutlineIcon color="success" />,
      title: "Return Processed",
      description: "Your return request has been approved.",
      time: "1 day ago"
    },
    {
      id: 5,
      icon: <LocalShippingIcon color="primary" />,
      title: "Delivery Scheduled",
      description: "Your order will be delivered tomorrow.",
      time: "2 days ago"
    }
  ];

function Navbar() {
  const navigate = useNavigate();
  const [shoppingCart, setShoppingCart] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [login, setLogin] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { setLoginOpen } = useLogin();

  const handleCartOpen = () => {
    setShoppingCart(true);
  };

  const handleCartClose = () => {
    setShoppingCart(false);
  };

  const handleLogin = () => {
    setLogin(prevState => !prevState);
    setLoginOpen(false);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(prevState => !prevState);
  };

  const handleNotificationsToggle = () => {
    setNotifications(prevState => !prevState);
  };

  const performSearch = () => {
    // Your search functionality here
  };

  const NotificationsDropdown = () => (
    <Paper 
      sx={{ 
        position: 'absolute',  boxShadow: 3, borderRadius: 2,
        top: '100%', 
        right: 60, 
        width: 300, 
       
        maxHeight: '75vh',
        overflow: 'auto', 
        zIndex: 10, 
        p: 2 
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>Notifications</Typography>
      {/* Add your notification items here */}
              Notifications ({notificationsList.length})

   


       {notificationsList.map((notification) => (
        <React.Fragment key={notification.id}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              py: 1.5, 
              px: 1,
              '&:hover': { 
                backgroundColor: '#f0f0f0',
                cursor: 'pointer'
              }
            }}
          >
            <Box sx={{ mr: 2 }}>{notification.icon}</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {notification.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notification.description}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {notification.time}
              </Typography>
            </Box>
          </Box>
          <Divider />
        </React.Fragment>
      ))}
    </Paper>
  );

  return (
    <>
      <Box component="navbar" sx={{ position: "sticky", zIndex: 2, display: "flex", paddingX: { xs: 1, md: 4, lg: 8, xl: 10 }, justifyContent: "space-between", borderBottom: "inset", boxShadow: 3 }}>
        <Stack direction="row" alignItems="center" px={{ xs: 1, md: 3, xl: 4 }}>
          <Typography variant="h4" className="logo">
            <span style={{ fontWeight: "bold" }}> R</span>
            <span>
              <Box component="img" src={require("./recycle3.svg").default} alt="wardrobe" sx={{ width: 35, height: 30, color: "#EAC7C7" }} />
            </span>
            <span style={{ fontWeight: "bold" }} className="bold">R</span>
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={{ sm: 1, md: 3, lg: 5 }} borderLeft={{ sm: "inset" }} borderRight={{ sm: "inset" }} p={2.4} px={{ xs: 2.4, md: 10, lg: 20, xl: 25 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Link component={RouterLink} to="/" sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }}>
            Home
          </Link>
          <Link component={RouterLink} to="/c" sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }}>
            Products
          </Link>
          <Link
            component={RouterLink} to="#"
            sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }}>
            About Us
          </Link>
          <Link
            component={RouterLink} to="/contact"
            sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }}
          >
            Contact Us
          </Link>
        </Stack>

        <Stack direction="row" alignItems="center" sx={{position:"relative"}}spacing={{ xs: 0, md: 2 }} px={{ xs: 1, md: 3, lg: 4 }}>
          <IconButton onClick={handleCartOpen}>
            {shoppingCart ? <LocalMallIcon /> : <LocalMallOutlinedIcon />}
          </IconButton>
          <IconButton onClick={() => navigate("/createproduct")}>
             <AddIcon/>
          </IconButton>
          {!login && (
            <>
            <IconButton onClick={() => navigate("/profile")}>
              <PersonIcon />
            </IconButton>

            <IconButton onClick={handleNotificationsToggle}>
                 {notifications ? <NotificationsIcon />: <NotificationsNoneIcon />  }
            </IconButton>
            </>
          )}
              
          <IconButton onClick={performSearch}>
            <SearchIcon fontSize="medium" />
          </IconButton>

          <Button onClick={() => setLoginOpen(true)} variant="contained" color="primary" sx={{ backgroundColor: '#85586F', '&:hover': { backgroundColor: 'black', }, }} size="small">
            {login ? "Logout" : "Login"}
          </Button>
          <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Stack>

        {notifications && <NotificationsDropdown />}

        <Drawer PaperProps={{ sx: { width: 240 } }} anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
          <Stack direction="column" spacing={2} p={2}>
            <Link component={RouterLink} to="/" sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }} onClick={handleDrawerToggle}>
              Home
            </Link>
            <Link component={RouterLink} to="/c" sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }} onClick={handleDrawerToggle}>
              Products
            </Link>
            <Link component={RouterLink} to="#" sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }} onClick={handleDrawerToggle}>
              About Us
            </Link>
            <Link component={RouterLink} to="/contact" sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }} onClick={handleDrawerToggle}>
              Contact Us
            </Link>
          </Stack>
        </Drawer>
      </Box>
      {shoppingCart && <AddCart open={shoppingCart} onClose={handleCartClose} />}
    </>
  );
}

export default Navbar;