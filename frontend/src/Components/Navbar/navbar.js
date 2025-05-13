import React, { useState, useEffect, useRef } from "react";

import io from 'socket.io-client';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import Login from "../Login/login.js";
import {  toggleNotifications,  addNotification,  fetchNotifications,  closeNotifications,  markNotificationAsRead,  markAllNotificationsAsRead } from '../../redux/slices/notificationsSlice.js';

import {  Stack,  Link,  Box,  IconButton,  Typography,  Button,  Badge,  Drawer,  Divider,  Paper,  Menu,  ListItemIcon,  ListItemText,  MenuItem, List,ListItem,ListSubheader,Avatar} from "@mui/material";
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
import { jwtDecode } from "jwt-decode"; 




function Navbar() {
  const user = localStorage.getItem('token');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [shoppingCart, setShoppingCart] = useState(false);
  const [login, setLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { notifications, isOpen, unreadCount } = useSelector(state => state.notifications);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
   const dropdownRef = useRef(null);
  useEffect(() => {
  function handleClickOutside(event) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      dispatch(closeNotifications());
    }
  }

  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen, dispatch]);

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
 
  const handleMarkAsRead = (notification) => {
  dispatch(markNotificationAsRead(notification.id));

  // Ensure we navigate to the correct chat for the specific product and buyer/seller
  if (notification.title === 'New Message' && notification.product) {
    // Get current user ID from token
    const currentUserId = getUserId();
    
    // If current user is the recipient of the notification
    if (currentUserId) {
      // Use the sender ID from notification to open correct chat
      navigate(`/product/${notification.product}?openChat=true&chatPartnerId=${notification.sender}`);
    }
  }
};


    // Extract user ID from token
  const getUserId = () => {
    if (!user) return null;
    try {
      const decoded = jwtDecode(user);
      return decoded.id; // Extract the actual user ID
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };
  
  const userId = getUserId();
  const socketRef = useRef(null);
  // Add this at the top of your component
  

// Then update your socket connection effect
useEffect(() => {
  if (!user || !userId) return;
  
  // Only create a new socket if one doesn't exist
  if (!socketRef.current) {
    socketRef.current = io(`${process.env.REACT_APP_LOCAL_URL}`, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });
    
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      socketRef.current.emit('authenticate', userId);
    });
  }
  
  // Listen for new notifications
  const handleNewNotification = (notification) => {
    console.log('Received notification:', notification);
    
    if (notification) {
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
  };
  
  socketRef.current.on('new_notification', handleNewNotification);
  
  // Clean up only the event listener, not the socket
  return () => {
    if (socketRef.current) {
      socketRef.current.off('new_notification', handleNewNotification);
    }
  };
}, [userId,user, dispatch]);

// Add a separate cleanup for component unmount
useEffect(() => {
  return () => {
    if (socketRef.current) {
      console.log('Disconnecting socket on unmount');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };
}, []);
  

  // Fetch notifications when component mounts and user is logged in
  useEffect(() => {
    // Only fetch notifications if user is logged in
    console.log("Fetching notifications for user:", user); // Add debugging
    if (user) {
      dispatch(fetchNotifications());
      console.log("Fetching notifications for user:", user.id); // Add debugging
    }
  }, [user, dispatch]);

  
  const handleNotificationsToggle = () => {
    dispatch(toggleNotifications());
  };

  const handleCartOpen = () => {
    setShoppingCart(true);
  };

  const handleCartClose = () => {
    setShoppingCart(false);
  };

   useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    setIsLoggedIn(true);
  } else {
    setIsLoggedIn(false);
  }
}, [localStorage.getItem('token')]); 

  const handleLogin = () => {
    setLogin(true);
    
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


  const handleLogout = () => {
     localStorage.removeItem('token'); 
     setIsLoggedIn(false);  
     setDrawerOpen(false);
  };

// In your Navbar component
const [searchOpen, setSearchOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const searchInputRef = useRef(null);
const searchContainerRef = useRef(null);

// Close search when clicking outside
useEffect(() => {
  function handleClickOutside(event) {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
      setSearchOpen(false);
    }
  }

  if (searchOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [searchOpen]);

// Focus input when search opens
useEffect(() => {
  if (searchOpen && searchInputRef.current) {
    searchInputRef.current.focus();
  }
}, [searchOpen]);

const performSearch = () => {
  setSearchOpen(true);
};


const handleSearchSubmit = (e) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    navigate(`/c?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  }
};

// In Navbar.js - Add these state variables
const [searchSuggestions, setSearchSuggestions] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);

// Add this function to fetch suggestions as user types
const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Only fetch suggestions if there's actual input
    if (value && value.length >= 2) {
      generateSearchSuggestions(value);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  };

  // Function to fetch search suggestions

  const generateSearchSuggestions = async (query) => {
    if (!query || query.length <= 0) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      // Fetch all products from catalogue
      const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/catalogue`);
      console.log("Fetched products:", response.data);
      
      if (response.data && response.data.length > 0) {
        // Filter products that match the query (case-insensitive)
        const lowerQuery = query.toLowerCase();
        const filteredProducts = response.data.filter(product => {
          // Check if the query matches product name, description, or category
          return (
              (product.name && product.name.toLowerCase() === lowerQuery) ||
              (product.name && product.name.toLowerCase().includes(lowerQuery))
          );
        });
        
        // Convert filtered products to suggestion format
        const suggestions = filteredProducts.map(product => ({
          id: product._id,
          text: product.name,
          category: product.category,
          images: product.images,
        }));
        
        console.log("Filtered suggestions:", suggestions);
        
        // Limit to 5 suggestions
        setSearchSuggestions(suggestions.slice(0, 5));
        setShowSuggestions(suggestions.length > 0);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // Fallback to empty suggestions
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    navigate(`/c?search=${encodeURIComponent(suggestion.text)}`);
    setSearchOpen(false);
  };

  const NotificationsDropdown = () => (
    <Paper ref={dropdownRef} sx={{ position: 'absolute', boxShadow: 3, borderRadius: 2, top: '100%', right: 200, width: 300, maxHeight: '75vh', overflow: 'auto', zIndex: 10, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <Box>
         <Typography variant="h6" sx={{ mb: 0 }}>
             Notifications
         </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
           {unreadCount} unread
        </Typography>
         </Box>
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
      
       <Box ref={searchContainerRef}>
          {searchOpen && (
            <Box
              component="form"  onSubmit={handleSearchSubmit}    sx={{    position: 'absolute',   top: '0',    left: '0',  right: '0',  width: "100vw", backgroundColor: '#f9f5f7', boxShadow: 3,  borderRadius: 1,   py: 2,  px: {xs: 5, sm: 10},  zIndex: 10000   }}  >
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Search Products</Typography>
              <Box sx={{ display: 'flex', width: '90%', position: 'relative' }}>
                <input  ref={searchInputRef}  type="text"    value={searchQuery}   onChange={handleSearchInputChange}   placeholder="Search for products..." style={{   flex: 1,    padding: '10px',  fontSize: '16px',border: '1px solid #ccc',      borderRadius: '4px 0 0 4px',  outline: 'none' }}   />
                <Button   type="submit"    variant="contained"  sx={{  marginLeft: '2%',   borderRadius: '0 4px 4px 0',   backgroundColor: '#85586F',   '&:hover': { backgroundColor: '#6d4659' }  }}>
                  <SearchIcon />
                </Button>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <Box sx={{
                    position: 'absolute',  top: '100%', left: 0,   width: '100%',    maxHeight: '300px', overflowY: 'auto', backgroundColor: 'white',  boxShadow: 3,  borderRadius: '0 0 4px 4px',   zIndex: 10001,  mt: 0.5}}>
                    {searchSuggestions.map((suggestion, index) => (
                      <Box key={suggestion.id || index}  onClick={() => handleSuggestionClick(suggestion)}  sx={{    p: 1.5,  borderBottom: index < searchSuggestions.length - 1 ? '1px solid #eee' : 'none', cursor: 'pointer',  '&:hover': {   backgroundColor: '#f5f5f5' },  display: 'flex',  alignItems: 'center' }}  >
                        <SearchIcon sx={{ mr: 1, color: '#85586F', fontSize: '1rem' }} />
                        <Box  component="img" src={suggestion?.images?.[0] || '/placeholder.jpg'} alt={suggestion.text} sx={{ width: '40px',  height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }}/>

                        <Box>
                          <Typography variant="body1">{suggestion.text}</Typography>
                          {suggestion.category && (
                            <Typography variant="caption" color="text.secondary">
                              in {suggestion.category}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo & Brand */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box component="img" src={require("./S.png")} alt="Logo" sx={{ width: 80, height: 45 }} />
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* My Account Section */}
        {isLoggedIn && (
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
        </List>)}
        
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
        
    
        {!isLoggedIn ? (
    <Button variant="contained" color="primary" onClick={handleLogin}  sx={{  mt: 2,  backgroundColor: '#85586F',   '&:hover': {  backgroundColor: '#6d4659', },  textTransform: 'uppercase',  py: 1 }}>
      Login
    </Button>
  ) : (
    <Button variant="contained"   color="primary"  fullWidth onClick={handleLogout}   startIcon={<LogoutIcon />} sx={{  mt: 2,  backgroundColor: '#85586F',   '&:hover': {  backgroundColor: '#6d4659', },  textTransform: 'uppercase',  py: 1 }}>
      Logout
    </Button>
  )}
      </Box>
    </Drawer>
  );

  return (
    <>
      <Box component="navbar" marginBottom={10} sx={{ position: "fixed", zIndex: 2, width: "100%", backgroundColor: "white", display: "flex", paddingX: { xs: 1, md: 4, lg: 8, xl: 10 }, justifyContent: "space-between", borderBottom: "inset", boxShadow: 3 }}>
      
      <Box ref={searchContainerRef}>
          {searchOpen && (
            <Box
              component="form"  onSubmit={handleSearchSubmit}    sx={{    position: 'absolute',   top: '0',    left: '0',  right: '0',  width: "100vw", backgroundColor: '#f9f5f7', boxShadow: 3,  borderRadius: 1,   py: 2,  px: {xs: 5, sm: 10},  zIndex: 10000   }}  >
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Search Products</Typography>
              <Box sx={{ display: 'flex', width: '90%', position: 'relative' }}>
                <input  ref={searchInputRef}  type="text"    value={searchQuery}   onChange={handleSearchInputChange}   placeholder="Search for products..." style={{   flex: 1,    padding: '10px',  fontSize: '16px',border: '1px solid #ccc',      borderRadius: '4px 0 0 4px',  outline: 'none' }}   />
                <Button   type="submit"    variant="contained"  sx={{  marginLeft: '2%',   borderRadius: '0 4px 4px 0',   backgroundColor: '#85586F',   '&:hover': { backgroundColor: '#6d4659' }  }}>
                  <SearchIcon />
                </Button>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <Box sx={{
                    position: 'absolute',  top: '100%', left: 0,   width: '100%',    maxHeight: '300px', overflowY: 'auto', backgroundColor: 'white',  boxShadow: 3,  borderRadius: '0 0 4px 4px',   zIndex: 10001,  mt: 0.5}}>
                    {searchSuggestions.map((suggestion, index) => (
                      <Box key={suggestion.id || index}  onClick={() => handleSuggestionClick(suggestion)}  sx={{    p: 1.5,  borderBottom: index < searchSuggestions.length - 1 ? '1px solid #eee' : 'none', cursor: 'pointer',  '&:hover': {   backgroundColor: '#f5f5f5' },  display: 'flex',  alignItems: 'center' }}  >
                        <SearchIcon sx={{ mr: 1, color: '#85586F', fontSize: '1rem' }} />
                        <Box  component="img" src={suggestion?.images?.[0] || '/placeholder.jpg'} alt={suggestion.text} sx={{ width: '40px',  height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }}/>

                        <Box>
                          <Typography variant="body1">{suggestion.text}</Typography>
                          {suggestion.category && (
                            <Typography variant="caption" color="text.secondary">
                              in {suggestion.category}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
     
     {login && (<Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}>
          {/* <Login setLogin={setLoginOpen} /> */}
           {login && <Login setLogin={setLogin} />}
           

        </Box> )}
   

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
          
          {isLoggedIn && (
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

        
  {!isLoggedIn ? (
    <Button variant="contained" color="primary" onClick={handleLogin}  sx={{   backgroundColor: '#85586F',  '&:hover': { backgroundColor: 'black' },  display: { xs: 'none', md: 'flex' }  }}  size="small">
      Login
    </Button>
  ) : (
    <Button variant="contained" color="secondary" onClick={handleLogout}  sx={{   backgroundColor: '#85586F',  '&:hover': { backgroundColor: 'black' },  display: { xs: 'none', md: 'flex' }  }}  size="small">
      Logout
    </Button>
  )}


          
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