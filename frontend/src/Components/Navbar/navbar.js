import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useLogin } from "../Login/logincontext";
import { useDispatch, useSelector } from 'react-redux';
import { 
  toggleNotifications, 
  addNotification, 
  fetchNotifications, 
  closeNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../../redux/slices/notificationsSlice.js';

import { 
  Stack, 
  Link, 
  Box, 
  IconButton, 
  Typography, 
  Button, 
  Badge, 
  Drawer, 
  Divider, 
  Paper, 
  Menu, 
  ListItemIcon, 
  ListItemText, 
  MenuItem,
  List,
  ListItem,
  ListSubheader,
  Avatar
} from "@mui/material";
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddCart from "../ShoppingCart/AddCart";
import AddIcon from '@mui/icons-material/Add';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import GavelIcon from '@mui/icons-material/Gavel';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactsIcon from '@mui/icons-material/Contacts';
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar() {
  const user = localStorage.getItem('token');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [shoppingCart, setShoppingCart] = useState(false);
  const [login, setLogin] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { setLoginOpen } = useLogin();
  const { notifications, isOpen, unreadCount } = useSelector(state => state.notifications);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSimpleProduct = () => {
    navigate("/createproduct");
    handleClose();
    setDrawerOpen(false);
  };

  const handleBiddingProduct = () => {
    navigate("/create");
    handleClose();
    setDrawerOpen(false);
  };

  // Set up socket connection for real-time notifications
  useEffect(() => {
    // Create socket connection
    const socket = io(`${process.env.REACT_APP_LOCAL_URL}`);
    
    // Listen for new notifications
    socket.on('new_notification', (notification) => {
      console.log('Received notification:', notification);
      
      // Make sure the notification has the expected format before adding it
      if (notification) {
        // Format the notification for the Redux store
        const formattedNotification = {
          id: notification._id || Date.now(),
          title: notification.title,
          description: notification.description,
          time: 'Just now',
          isRead: false,
          product: notification.product,
          sender: notification.sender,
          count: notification.count || 1
        };
        
        dispatch(addNotification(formattedNotification));
      }
    });
    
    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  // Fetch notifications when component mounts and user is logged in
  useEffect(() => {
    // Only fetch notifications if user is logged in
    console.log("Fetching notifications for user:", user); // Add debugging
    if (user) {
      dispatch(fetchNotifications());
      console.log("Fetching notifications for user:", user.id); // Add debugging
    }
  }, [user, dispatch]);

  // Handle marking notifications as read
  const handleMarkAsRead = (notification) => {
    dispatch(markNotificationAsRead(notification.id));
    
    // If it's a message notification, navigate to the chat for that product
    if (notification.title === 'New Message' && notification.product) {
      navigate(`/product/${notification.product}/chat`);
    }
  };
  
  const handleNotificationsToggle = () => {
    dispatch(toggleNotifications());
  };

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

  const navigateToProfile = () => {
    const token = localStorage.getItem('token');
    let userId;
    
    if (user?.id) {
      userId = user.id;
    } else if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); 
        userId = decodedToken.id;
      } catch (error) {
        console.error("Error decoding token:", error);
        alert("Invalid token");
      }
    } 
    
    if (userId) {
      navigate(`/profile/${userId}`);
      setDrawerOpen(false);
    } else {
      console.error("User ID is missing.");
      alert("User ID is not available");
    }
  };

  const performSearch = () => {
    // Your search functionality here
  };

  const handleLogout = () => {
    setLoginOpen(true);
    setDrawerOpen(false);
  };

  const NotificationsDropdown = () => (
    <Paper sx={{ position: 'absolute', boxShadow: 3, borderRadius: 2, top: '100%', right: 200, width: 300, maxHeight: '75vh', overflow: 'auto', zIndex: 10, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Notifications ({unreadCount} unread)
        </Typography>
        <Button size="small" onClick={() => dispatch(markAllNotificationsAsRead())}>
          Mark All as Read
        </Button>
      </Box>
  
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <React.Fragment key={notification.id}>
            <Box  sx={{ display: 'flex',  alignItems: 'center', gap: 2, backgroundColor: notification.isRead ? '#f0f0f0' : 'white',opacity: notification.isRead ? 0.7 : 1, cursor: 'pointer','&:hover': {  backgroundColor: notification.isRead ? '#e0e0e0' : '#f5f5f5'}  }} onClick={() => handleMarkAsRead(notification)} >
              <Box sx={{ m: 2, display: 'flex', alignItems: 'center' }}>
                {notification.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{  fontWeight: notification.isRead ? 'normal' : 'bold', color: notification.isRead ? 'text.secondary' : 'text.primary'  }}>
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
        ))
      ) : (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
          No notifications to display
        </Typography>
      )}
    </Paper>
  );

  // Enhanced Mobile Sidebar Menu
  const MobileSidebar = () => (
    <Drawer  PaperProps={{  sx: {  width: 240, bgcolor: '#f9f5f7' } }}  anchor="left"   open={drawerOpen}  onClose={handleDrawerToggle}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo & Brand */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box component="img" src={require("./S.png")} alt="Logo" sx={{ width: 80, height: 45 }} />
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* My Account Section */}
        <List subheader={
            <ListSubheader component="div" sx={{ bgcolor: 'transparent', color: '#85586F', fontWeight: 'bold' }}>
              MY ACCOUNT
            </ListSubheader>
          }>
          <ListItem button onClick={navigateToProfile} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 35 }}>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </ListItem>
        </List>
        
        {/* Add Products Section */}
        <List  subheader={
            <ListSubheader component="div" sx={{ bgcolor: 'transparent', color: '#85586F', fontWeight: 'bold' }}>
              ADD PRODUCTS
            </ListSubheader>  } >
          <ListItem button onClick={handleSimpleProduct} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 35 }}>
              <ShoppingBagIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Simple Product" />
          </ListItem>
          <ListItem button onClick={handleBiddingProduct} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 35 }}>
              <GavelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Bidding Product" />
          </ListItem>
        </List>

        {/* Navigation Section */}
        <List subheader={  <ListSubheader component="div" sx={{ bgcolor: 'transparent', color: '#85586F', fontWeight: 'bold' }}>
              NAVIGATION
            </ListSubheader> }>
          <ListItem   button  component={RouterLink}  to="/"  onClick={handleDrawerToggle} sx={{ py: 0.5 }} >
            <ListItemIcon sx={{ minWidth: 35 }}>
              <HomeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem  button  component={RouterLink}    to="/c"    onClick={handleDrawerToggle}   sx={{ py: 0.5 }} >
            <ListItemIcon sx={{ minWidth: 35 }}>
              <ShoppingBagIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Products" />
          </ListItem>
          <ListItem    button   component={RouterLink}   to="#"  onClick={handleDrawerToggle} sx={{ py: 0.5 }} >
            <ListItemIcon sx={{ minWidth: 35 }}>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="About Us" />
          </ListItem>
          <ListItem   button   component={RouterLink}   to="/contact"  onClick={handleDrawerToggle} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 35 }}>
              <ContactsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Contact Us" />
          </ListItem>
        </List>
        
        {/* Spacer to push logout to bottom */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Logout Button */}
        <Button   variant="contained"   color="primary"  fullWidth onClick={handleLogout}  startIcon={<LogoutIcon />} sx={{  mt: 2,  backgroundColor: '#85586F',   '&:hover': {  backgroundColor: '#6d4659', },  textTransform: 'uppercase',  py: 1 }} >
          Logout
        </Button>
      </Box>
    </Drawer>
  );

  return (
    <>
      <Box component="navbar" marginBottom={10} sx={{ position: "fixed", zIndex: 2, width: "100%", backgroundColor: "white", display: "flex", paddingX: { xs: 1, md: 4, lg: 8, xl: 10 }, justifyContent: "space-between", borderBottom: "inset", boxShadow: 3 }}>
        <Stack direction="row" alignItems="center" px={{ xs: 1, md: 3, xl: 4 }}>
          <Typography variant="h4" className="logo">
            <span>
              <Box component="img" src={require("./S.png")} alt="Logo" sx={{ width: 100, height: 55 }} />
            </span>
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={{ sm: 1, md: 2, lg: 2, xl:5 }} borderLeft={{ sm: "inset" }} borderRight={{ sm: "inset" }}  px={{ xs: 2.4, md: 10, lg: 10, xl: 25 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Link component={RouterLink} to="/" sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }}>
            Home
          </Link>
          <Link component={RouterLink} to="/c" sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }}>
            Products
          </Link>
          <Link component={RouterLink} to="#" sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }}>
            About Us
          </Link>
          <Link component={RouterLink} to="/contact" sx={{ color: "black", fontWeight: 'bold', textDecoration: 'none', '&:hover': { color: "#F4B183", fontWeight: 'bold' } }}>
            Contact Us
          </Link>
        </Stack>

        <Stack direction="row" alignItems="center" sx={{ position: "relative" }} spacing={{ xs: 0, md: 2 }} px={{ xs: 1, md: 3, lg: 15 }}>
          <IconButton onClick={() => setShoppingCart(!shoppingCart)}>
            {shoppingCart ? <LocalMallIcon /> : <LocalMallOutlinedIcon />}
          </IconButton>

          <IconButton    onClick={handleAddClick} aria-controls={open ? 'add-product-menu' : undefined} aria-haspopup="true"  aria-expanded={open ? 'true' : undefined} sx={{ display: { xs: 'none', md: 'flex' } }} >
            <AddIcon />
          </IconButton>

          <Menu   id="add-product-menu"  anchorEl={anchorEl}  open={open} onClose={handleClose}  MenuListProps={{ 'aria-labelledby': 'add-product-button', }} PaperProps={{  elevation: 3,  sx: {  minWidth: '200px', mt: 1,  } }} transformOrigin={{ horizontal: 'center', vertical: 'top' }}  anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}  slotProps={{paper: {  sx: { '& .MuiList-root': {   padding: 0, }, }, }, }}>
            <MenuItem onClick={handleSimpleProduct}>
              <ListItemIcon>
                <ShoppingBagIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Create Simple Product</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleBiddingProduct}>
              <ListItemIcon>
                <GavelIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Create Bidding Product</ListItemText>
            </MenuItem>
          </Menu>
          
          {!login && (
            <>
              <IconButton   onClick={navigateToProfile}  sx={{ display: { xs: 'none', md: 'flex' } }}  >
                <PersonIcon />
              </IconButton>

              <IconButton onClick={(e) => { e.stopPropagation(); handleNotificationsToggle(); }}>
                {unreadCount > 0 ? (
                  <Badge badgeContent={unreadCount} color="primary">
                    <NotificationsIcon />
                  </Badge>
                ) : (
                  <NotificationsNoneIcon />
                )}
              </IconButton>
            </>
          )}
              
          <IconButton onClick={performSearch}>
            <SearchIcon fontSize="medium" />
          </IconButton>

          <Button   onClick={() => setLoginOpen(true)}   variant="contained"   color="primary"   sx={{   backgroundColor: '#85586F',  '&:hover': { backgroundColor: 'black' },  display: { xs: 'none', md: 'flex' }  }}  size="small">
            {login ? "Logout" : "Login"}
          </Button>
          
          <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Stack>

        {isOpen && <NotificationsDropdown />}

        {/* Enhanced Mobile Side Menu */}
        <MobileSidebar />
      </Box>
      {shoppingCart && <AddCart open={shoppingCart} onClose={handleCartClose} />}
      <Box sx={{ height: "64px" }} />
    </>
  );
}

export default Navbar;