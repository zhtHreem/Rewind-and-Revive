import React, { useState, useEffect, useRef } from "react";

import io from 'socket.io-client';
import { useNavigate, NavLink, Link as RouterLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import Login from "../Login/login.js";
import {
  toggleNotifications,
  addNotification,
  fetchNotifications,
  closeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../redux/slices/notificationsSlice.js';

import {
  Stack,
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
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import StarsIcon from '@mui/icons-material/Stars';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { jwtDecode } from "jwt-decode";

// ----- shared design tokens -----
const COLORS = {
  surface: '#FFFFFF',
  border: '#ECEAE4',
  accent: '#85586F',
  accentDark: '#6B4459',
  accentSoft: '#F5EEF1',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  live: '#E53935',
};

// Primary nav items used in both desktop bar + mobile drawer
const NAV_ITEMS = [
  { label: 'Home',     to: '/' },
  { label: 'Shop',     to: '/catalogue' },
  { label: 'Auctions', to: '/bidProduct', live: true },
  { label: 'About',    to: '/AboutUs' },
];

// Reusable desktop nav link with active underline
const NavItem = ({ item }) => (
  <NavLink
    to={item.to}
    end={item.to === '/'}
    style={{ textDecoration: 'none' }}
  >
    {({ isActive }) => (
      <Box
        sx={{
          position: 'relative',
          px: 1.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          cursor: 'pointer',
          color: isActive ? COLORS.accent : COLORS.textPrimary,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0.2,
          transition: 'color 0.2s ease',
          '&:hover': { color: COLORS.accent },
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 14,
            height: 2,
            backgroundColor: COLORS.accent,
            borderRadius: 2,
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'all 0.25s ease',
          },
        }}
      >
        {item.star && <StarsIcon sx={{ fontSize: 16, color: COLORS.accent }} />}
        {item.label}
        {item.live && (
          <Box
            sx={{
              ml: 0.25,
              px: 0.75,
              py: 0.125,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 0.6,
              color: '#fff',
              bgcolor: COLORS.live,
              borderRadius: 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              '&::before': { content: '"●"', fontSize: 7 },
            }}
          >
            LIVE
          </Box>
        )}
      </Box>
    )}
  </NavLink>
);

// Shared icon-button hover styling
const iconBtnSx = {
  color: COLORS.textPrimary,
  borderRadius: 2,
  '&:hover': { bgcolor: COLORS.accentSoft, color: COLORS.accent },
};

function Navbar() {
  const user = localStorage.getItem('token');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [shoppingCart, setShoppingCart] = useState(false);
  const [login, setLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('token'));

  const [drawerOpen, setDrawerOpen] = useState(false);

  const { notifications, isOpen, unreadCount } = useSelector(state => state.notifications);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const profileOpen = Boolean(profileAnchorEl);
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, dispatch]);

  const handleAddClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

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
    if (notification.title === 'New Message' && notification.product) {
      const currentUserId = getUserId();
      if (currentUserId) {
        navigate(`/product/${notification.product}?openChat=true&chatPartnerId=${notification.sender}`);
      }
    }
  };

  const getUserId = () => {
    if (!user) return null;
    try {
      const decoded = jwtDecode(user);
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        return null;
      }
      return decoded.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      return null;
    }
  };

  const userId = getUserId();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !userId) return;
    if (!socketRef.current) {
      socketRef.current = io(`${process.env.REACT_APP_LOCAL_URL}`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });
      socketRef.current.on('connect', () => {
        socketRef.current.emit('authenticate', userId);
      });
    }

    const handleNewNotification = (notification) => {
      if (notification) {
        const formattedNotification = {
          id: notification._id || Date.now(),
          title: notification.title,
          description: notification.description,
          time: 'Just now',
          isRead: false,
          product: notification.product,
          sender: notification.sender,
          count: notification.count || 1,
        };
        dispatch(addNotification(formattedNotification));
      }
    };

    socketRef.current.on('new_notification', handleNewNotification);
    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_notification', handleNewNotification);
      }
    };
  }, [userId, user, dispatch]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [user, dispatch]);

  const handleNotificationsToggle = () => dispatch(toggleNotifications());
  const handleCartOpen = () => setShoppingCart(true);
  const handleCartClose = () => setShoppingCart(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
    else setIsLoggedIn(false);
  }, [localStorage.getItem('token')]);

  const handleLogin = () => setLogin(true);

  const handleDrawerToggle = () => setDrawerOpen(prevState => !prevState);

  const navigateToProfile = () => {
    handleProfileClose();
    const token = localStorage.getItem('token');
    let uid;
    if (user?.id) {
      uid = user.id;
    } else if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        uid = decodedToken.id;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    if (uid) {
      navigate(`/profile/${uid}`);
      setDrawerOpen(false);
    }
  };

  const navigateToBadges = () => {
    handleProfileClose();
    setDrawerOpen(false);
    navigate('/badge');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setDrawerOpen(false);
    handleProfileClose();
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const performSearch = () => setSearchOpen(true);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const catalogueCacheRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (value && value.length >= 2) {
      searchDebounceRef.current = setTimeout(() => {
        generateSearchSuggestions(value);
      }, 250);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  };

  const generateSearchSuggestions = async (query) => {
    if (!query || query.length <= 0) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      if (!catalogueCacheRef.current) {
        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/product/catalogue`);
        catalogueCacheRef.current = response.data || [];
      }
      const data = catalogueCacheRef.current;
      if (data.length > 0) {
        const lowerQuery = query.toLowerCase();
        const filteredProducts = data.filter(product =>
          product.name && product.name.toLowerCase().includes(lowerQuery)
        );
        const suggestions = filteredProducts.slice(0, 5).map(product => ({
          id: product._id,
          text: product.name,
          category: product.category,
          images: product.images,
        }));
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    navigate(`/catalogue?search=${encodeURIComponent(suggestion.text)}`);
    setSearchOpen(false);
  };

  // ----- search overlay (shared between desktop + mobile) -----
  const SearchOverlay = () => (
    searchOpen && (
      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bgcolor: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          py: 2.5,
          px: { xs: 2, md: 6 },
          zIndex: 10000,
        }}
      >
        <Box sx={{ maxWidth: 760, mx: 'auto', position: 'relative' }}>
          <TextField
            fullWidth
            inputRef={searchInputRef}
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Search for products, brands, eras..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: COLORS.textSecondary }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    sx={iconBtnSx}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontSize: 16,
                '& fieldset': { borderColor: COLORS.border },
                '&:hover fieldset': { borderColor: COLORS.accent },
                '&.Mui-focused fieldset': { borderColor: COLORS.accent },
              },
            }}
          />
          {showSuggestions && searchSuggestions.length > 0 && (
            <Paper
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                mt: 1,
                borderRadius: 2,
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                maxHeight: 380,
                overflowY: 'auto',
                zIndex: 10001,
              }}
              elevation={0}
            >
              {searchSuggestions.map((suggestion, index) => (
                <Box
                  key={suggestion.id || index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    borderBottom: index < searchSuggestions.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                    '&:hover': { bgcolor: COLORS.accentSoft },
                  }}
                >
                  <Box
                    component="img"
                    src={suggestion?.images?.[0] || '/placeholder.jpg'}
                    alt={suggestion.text}
                    sx={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>
                      {suggestion.text}
                    </Typography>
                    {suggestion.category && (
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>
                        in {suggestion.category}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
      </Box>
    )
  );

  // ----- notifications dropdown -----
  const NotificationsDropdown = () => (
    <Paper
      ref={dropdownRef}
      elevation={0}
      sx={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: { xs: 8, md: 24 },
        width: { xs: 'calc(100vw - 16px)', sm: 360 },
        maxHeight: '75vh',
        overflow: 'auto',
        zIndex: 10,
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
        bgcolor: COLORS.surface,
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.border}` }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: COLORS.textPrimary }}>Notifications</Typography>
          <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>
            {unreadCount} unread
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={() => dispatch(markAllNotificationsAsRead())}
          sx={{
            textTransform: 'none',
            color: COLORS.accent,
            fontWeight: 600,
            '&:hover': { bgcolor: COLORS.accentSoft },
          }}
        >
          Mark all read
        </Button>
      </Box>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <Box
            key={notification.id}
            onClick={() => handleMarkAsRead(notification)}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              cursor: 'pointer',
              borderBottom: `1px solid ${COLORS.border}`,
              opacity: notification.isRead ? 0.6 : 1,
              bgcolor: notification.isRead ? 'transparent' : COLORS.accentSoft,
              '&:hover': { bgcolor: notification.isRead ? COLORS.accentSoft : '#EEDCE4' },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: notification.isRead ? 500 : 700, fontSize: 14, color: COLORS.textPrimary }}>
                {notification.title}
              </Typography>
              <Typography sx={{ fontSize: 13, color: COLORS.textSecondary, mt: 0.25 }}>
                {notification.description}
              </Typography>
              <Typography sx={{ fontSize: 11, color: COLORS.textSecondary, mt: 0.5 }}>
                {notification.time}
              </Typography>
            </Box>
          </Box>
        ))
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography sx={{ fontSize: 14, color: COLORS.textSecondary }}>
            No notifications yet
          </Typography>
        </Box>
      )}
    </Paper>
  );

  // ----- mobile drawer -----
  const MobileSidebar = () => (
    <Drawer
      PaperProps={{ sx: { width: 280, bgcolor: COLORS.surface } }}
      anchor="left"
      open={drawerOpen}
      onClose={handleDrawerToggle}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box
            component="img"
            src={require("./S.png")}
            alt="Logo"
            sx={{ height: 40, objectFit: 'contain' }}
          />
          <IconButton onClick={handleDrawerToggle} sx={iconBtnSx} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <List
          subheader={
            <ListSubheader sx={{ bgcolor: 'transparent', color: COLORS.accent, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, lineHeight: 2, px: 0 }}>
              BROWSE
            </ListSubheader>
          }
          sx={{ p: 0, mb: 1 }}
        >
          {NAV_ITEMS.map((item) => (
            <ListItem
              key={item.to}
              button
              component={RouterLink}
              to={item.to}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 2,
                py: 1,
                '&:hover': { bgcolor: COLORS.accentSoft },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: COLORS.textPrimary }}>
                {item.label === 'Home' && <HomeIcon fontSize="small" />}
                {item.label === 'Shop' && <ShoppingBagIcon fontSize="small" />}
                {item.label === 'Auctions' && <GavelIcon fontSize="small" />}
                {item.label === 'Celebrity' && <StarsIcon fontSize="small" />}
                {item.label === 'About' && <InfoIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}
              />
              {item.live && (
                <Box sx={{ px: 0.75, py: 0.125, fontSize: 9, fontWeight: 700, color: '#fff', bgcolor: COLORS.live, borderRadius: 1 }}>
                  LIVE
                </Box>
              )}
            </ListItem>
          ))}
          <ListItem
            button
            component={RouterLink}
            to="/contact"
            onClick={handleDrawerToggle}
            sx={{ borderRadius: 2, py: 1, '&:hover': { bgcolor: COLORS.accentSoft } }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: COLORS.textPrimary }}>
              <ContactsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Contact"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}
            />
          </ListItem>
        </List>

        <List
          subheader={
            <ListSubheader sx={{ bgcolor: 'transparent', color: COLORS.accent, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, lineHeight: 2, px: 0, mt: 1 }}>
              SELL
            </ListSubheader>
          }
          sx={{ p: 0, mb: 1 }}
        >
          <ListItem button onClick={handleSimpleProduct} sx={{ borderRadius: 2, py: 1, '&:hover': { bgcolor: COLORS.accentSoft } }}>
            <ListItemIcon sx={{ minWidth: 36, color: COLORS.textPrimary }}>
              <ShoppingBagIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Sell an item" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
          </ListItem>
          <ListItem button onClick={handleBiddingProduct} sx={{ borderRadius: 2, py: 1, '&:hover': { bgcolor: COLORS.accentSoft } }}>
            <ListItemIcon sx={{ minWidth: 36, color: COLORS.textPrimary }}>
              <GavelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Start an auction" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
          </ListItem>
        </List>

        {isLoggedIn && (
          <List
            subheader={
              <ListSubheader sx={{ bgcolor: 'transparent', color: COLORS.accent, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, lineHeight: 2, px: 0, mt: 1 }}>
                ACCOUNT
              </ListSubheader>
            }
            sx={{ p: 0 }}
          >
            <ListItem button onClick={navigateToProfile} sx={{ borderRadius: 2, py: 1, '&:hover': { bgcolor: COLORS.accentSoft } }}>
              <ListItemIcon sx={{ minWidth: 36, color: COLORS.textPrimary }}>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="My profile" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
            </ListItem>
            <ListItem button onClick={navigateToBadges} sx={{ borderRadius: 2, py: 1, '&:hover': { bgcolor: COLORS.accentSoft } }}>
              <ListItemIcon sx={{ minWidth: 36, color: COLORS.textPrimary }}>
                <EmojiEventsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="My badges" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
            </ListItem>
          </List>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {!isLoggedIn ? (
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            sx={{
              mt: 2,
              bgcolor: COLORS.accent,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 1.25,
              boxShadow: 'none',
              '&:hover': { bgcolor: COLORS.accentDark, boxShadow: 'none' },
            }}
          >
            Log in
          </Button>
        ) : (
          <Button
            variant="outlined"
            fullWidth
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              mt: 2,
              borderColor: COLORS.border,
              color: COLORS.textPrimary,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 1.25,
              '&:hover': { borderColor: COLORS.accent, color: COLORS.accent, bgcolor: COLORS.accentSoft },
            }}
          >
            Log out
          </Button>
        )}
      </Box>
    </Drawer>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          width: '100%',
          bgcolor: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Box ref={searchContainerRef}>
          <SearchOverlay />
        </Box>

        {login && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}>
            <Login setLogin={setLogin} />
          </Box>
        )}

        <Box
          sx={{
            maxWidth: 1440,
            mx: 'auto',
            px: { xs: 2, md: 4, lg: 6 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            minHeight: 72,
          }}
        >
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Box
              component="img"
              src={require("./S.png")}
              alt="Rewind & Revive"
              sx={{ height: 44, objectFit: 'contain' }}
            />
          </Box>

          {/* Desktop nav links */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}
          >
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </Stack>

          {/* Right actions */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ position: 'relative' }}
          >
            <Tooltip title="Search">
              <IconButton onClick={performSearch} sx={iconBtnSx}>
                <SearchIcon />
              </IconButton>
            </Tooltip>

            {/* Sell button — labeled, not just a + */}
            <Button
              onClick={handleAddClick}
              startIcon={<AddIcon />}
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 14,
                color: COLORS.accent,
                borderRadius: 2,
                px: 1.5,
                ml: 0.5,
                '&:hover': { bgcolor: COLORS.accentSoft },
              }}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
            >
              Sell
            </Button>

            <Menu
              id="add-product-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1,
                  minWidth: 220,
                  borderRadius: 2,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                },
              }}
            >
              <MenuItem onClick={handleSimpleProduct} sx={{ py: 1.25, '&:hover': { bgcolor: COLORS.accentSoft } }}>
                <ListItemIcon><ShoppingBagIcon fontSize="small" sx={{ color: COLORS.accent }} /></ListItemIcon>
                <ListItemText primary="Sell an item" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              </MenuItem>
              <MenuItem onClick={handleBiddingProduct} sx={{ py: 1.25, '&:hover': { bgcolor: COLORS.accentSoft } }}>
                <ListItemIcon><GavelIcon fontSize="small" sx={{ color: COLORS.accent }} /></ListItemIcon>
                <ListItemText primary="Start an auction" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              </MenuItem>
            </Menu>

            <Tooltip title="Cart">
              <IconButton onClick={() => setShoppingCart(!shoppingCart)} sx={iconBtnSx}>
                {shoppingCart ? <LocalMallIcon /> : <LocalMallOutlinedIcon />}
              </IconButton>
            </Tooltip>

            {isLoggedIn && (
              <>
                <Tooltip title="Notifications">
                  <IconButton
                    onClick={(e) => { e.stopPropagation(); handleNotificationsToggle(); }}
                    sx={iconBtnSx}
                  >
                    {unreadCount > 0 ? (
                      <Badge
                        badgeContent={unreadCount}
                        sx={{ '& .MuiBadge-badge': { bgcolor: COLORS.accent, color: '#fff' } }}
                      >
                        <NotificationsIcon />
                      </Badge>
                    ) : (
                      <NotificationsNoneIcon />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Account">
                  <IconButton
                    onClick={handleProfileClick}
                    sx={{ ...iconBtnSx, display: { xs: 'none', md: 'inline-flex' } }}
                  >
                    <PersonOutlineIcon />
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={profileAnchorEl}
                  open={profileOpen}
                  onClose={handleProfileClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      mt: 1,
                      minWidth: 220,
                      borderRadius: 2,
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <MenuItem onClick={navigateToProfile} sx={{ py: 1.25, '&:hover': { bgcolor: COLORS.accentSoft } }}>
                    <ListItemIcon><PersonIcon fontSize="small" sx={{ color: COLORS.accent }} /></ListItemIcon>
                    <ListItemText primary="My profile" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
                  </MenuItem>
                  <MenuItem onClick={navigateToBadges} sx={{ py: 1.25, '&:hover': { bgcolor: COLORS.accentSoft } }}>
                    <ListItemIcon><EmojiEventsOutlinedIcon fontSize="small" sx={{ color: COLORS.accent }} /></ListItemIcon>
                    <ListItemText primary="My badges" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
                  </MenuItem>
                  <Divider sx={{ borderColor: COLORS.border }} />
                  <MenuItem onClick={handleLogout} sx={{ py: 1.25, '&:hover': { bgcolor: COLORS.accentSoft } }}>
                    <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: COLORS.textSecondary }} /></ListItemIcon>
                    <ListItemText primary="Log out" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
                  </MenuItem>
                </Menu>
              </>
            )}

            {!isLoggedIn && (
              <Button
                variant="contained"
                onClick={handleLogin}
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  ml: 1,
                  bgcolor: COLORS.accent,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  px: 2.5,
                  py: 0.85,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: COLORS.accentDark, boxShadow: 'none' },
                }}
              >
                Log in
              </Button>
            )}

            <IconButton
              sx={{ ...iconBtnSx, display: { xs: 'inline-flex', md: 'none' }, ml: 0.5 }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Stack>

          {isOpen && <NotificationsDropdown />}
        </Box>

        <MobileSidebar />
      </Box>

      {shoppingCart && (
        <Box
          onClick={handleCartClose}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1200,
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ width: { xs: '85vw', sm: 380 }, height: "100%", boxShadow: "-2px 0 8px rgba(0,0,0,0.2)", bgcolor: COLORS.surface }}
          >
            <AddCart onClose={handleCartClose} />
          </Box>
        </Box>
      )}
    </>
  );
}

export default Navbar;
