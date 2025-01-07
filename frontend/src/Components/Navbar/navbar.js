import React, { useState ,useEffect} from "react";
import io from 'socket.io-client';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useLogin } from "../Login/logincontext";

import { useDispatch, useSelector } from 'react-redux';
import { toggleNotifications,addNotification,  closeNotifications,markNotificationAsRead,markAllNotificationsAsRead} from '../../redux/slices/notificationsSlice.js';


import { Stack, Link, Box, IconButton, Typography, Button,Badge, Drawer, Divider,Paper ,Menu,ListItemIcon,ListItemText,MenuItem} from "@mui/material";
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddCart from "../ShoppingCart/AddCart";
import AddIcon from '@mui/icons-material/Add';
  // Assuming the user data is stored in the login context

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import GavelIcon from '@mui/icons-material/Gavel';

 
function Navbar() {
  const { user } = useLogin();
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
  };

  const handleBiddingProduct = () => {
    navigate("/create");
    handleClose();
  };
 useEffect(() => {
    // Create socket connection
    const socket = io('http://localhost:5000'); 
      socket.emit('request_test_notification');

    // Listen for new notifications
    socket.on('new_notification', (notification) => {
      dispatch(addNotification(notification));
    });

    // Cleanup socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);
  
  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
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

  

  const performSearch = () => {
    // Your search functionality here
  };

 


    const NotificationsDropdown = () => (
    <Paper sx={{  position: 'absolute',boxShadow: 3,borderRadius: 2,  top: '100%',right: 200, width: 300,   maxHeight: '75vh', overflow: 'auto',zIndex: 10,   p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>  Notifications ({unreadCount} unread) </Typography>
        <Button   size="small"  onClick={() => dispatch(markAllNotificationsAsRead())} > Mark All as Read </Button>
      </Box>
  
      {notifications.map((notification) => (
        <React.Fragment key={notification.id}>
          <Box   sx={{ display: 'flex', alignItems: 'center',gap: 2  , backgroundColor: notification.isRead ? '#f0f0f0' : 'white', opacity: notification.isRead ? 0.7 : 1, cursor: 'pointer',  '&:hover': {  backgroundColor: notification.isRead ? '#e0e0e0' : '#f5f5f5'  }  }}  onClick={() => handleMarkAsRead(notification.id)}>
            <Box sx={{ m: 2 ,display: 'flex', alignItems: 'center' }}>{notification.icon}</Box>
            <Box>
              <Typography variant="subtitle1" sx={{  fontWeight: notification.isRead ? 'normal' : 'bold',color: notification.isRead ? 'text.secondary' : 'text.primary' }}>
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
      <Box component="navbar" marginBottom={10} sx={{ position: "fixed", zIndex: 2,width:"100%",backgroundColor:"white", display: "flex", paddingX: { xs: 1, md: 4, lg: 8, xl: 10 }, justifyContent: "space-between", borderBottom: "inset", boxShadow: 3 }} >
        <Stack direction="row" alignItems="center" px={{ xs: 1, md: 3, xl: 4 }}>
          <Typography variant="h4" className="logo">
            <span>
            <Box component="img" src={require("./S.png")} alt="Logo" sx={{ width: 100, height: 55 }} />
            </span>
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={{ sm: 1, md: 3, lg: 5 }} borderLeft={{ sm: "inset" }} borderRight={{ sm: "inset" }} p={2.4} px={{ xs: 2.4, md: 10, lg: 20, xl: 25 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
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

        <Stack direction="row" alignItems="center" sx={{position:"relative"}} spacing={{ xs: 0, md: 2 }} px={{ xs: 1, md: 3, lg: 15 }}>
        <IconButton onClick={() => setShoppingCart(!shoppingCart)}>
              {shoppingCart ? <LocalMallIcon /> : <LocalMallOutlinedIcon />}
        </IconButton>

           <IconButton onClick={handleAddClick}  aria-controls={open ? 'add-product-menu' : undefined}  aria-haspopup="true"  aria-expanded={open ? 'true' : undefined}>
        <AddIcon />
      </IconButton>

      <Menu id="add-product-menu" anchorEl={anchorEl} open={open}  onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'add-product-button',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: '200px',
            mt: 1,
          }
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              '& .MuiList-root': {
                padding: 0,
              },
            },
          },
        }}
      >
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
            <IconButton onClick={() => {
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
  } else {
    console.error("User ID is missing.");
    alert("User ID is not available");
  }
}}>
  <PersonIcon />
</IconButton>




            <IconButton onClick={(e) => { e.stopPropagation();   handleNotificationsToggle();  }} >
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

          <Button onClick={() => setLoginOpen(true)} variant="contained" color="primary" sx={{ backgroundColor: '#85586F', '&:hover': { backgroundColor: 'black', }, }} size="small">
            {login ? "Logout" : "Login"}
          </Button>
          <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Stack>

        {isOpen && <NotificationsDropdown />}

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
      <Box sx={{ height: "64px" }} />
    </>
  );
}

export default Navbar;