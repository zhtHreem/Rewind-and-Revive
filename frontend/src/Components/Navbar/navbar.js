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
import StarsIcon from '@mui/icons-material/Stars';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { jwtDecode } from "jwt-decode";
import brandLogo from "../../assets/brand/logo.svg";
import NavSearch from "./NavSearch";
import './notifPanel.css';
import { AUTH_EVENT, OPEN_LOGIN_EVENT, announceAuthChange } from "../../utils/authEvents";

// ----- shared design tokens -----
const COLORS = {
  surface: '#FBF8F2',
  border: '#E3DCCD',
  accent: '#85586F',
  accentDark: '#6B4459',
  accentSoft: '#F5EEF1',
  textPrimary: '#1F1B16',
  textSecondary: '#6B635A',
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

  // Other parts of the page can ask for the login window, and tell us when someone logged in.
  useEffect(() => {
    const openLogin = () => setLogin(true);
    const sync = () => setIsLoggedIn(localStorage.getItem('token'));
    window.addEventListener(OPEN_LOGIN_EVENT, openLogin);
    window.addEventListener(AUTH_EVENT, sync);
    return () => {
      window.removeEventListener(OPEN_LOGIN_EVENT, openLogin);
      window.removeEventListener(AUTH_EVENT, sync);
    };
  }, []);

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


  const handleLogout = () => {
    localStorage.removeItem('token');
    announceAuthChange();
    setIsLoggedIn(false);
    setDrawerOpen(false);
    handleProfileClose();
  };

  // The search panel itself lives in NavSearch.js; the navbar only opens and closes it.
  const [searchOpen, setSearchOpen] = useState(false);
  const performSearch = () => setSearchOpen(true);

  // ----- notifications dropdown -----
  const NotificationsDropdown = () => (
    <div className="np" ref={dropdownRef} role="dialog" aria-label="Notifications">
      <div className="np__head">
        <div>
          <b>Notifications</b>
          <small>{unreadCount} unread</small>
        </div>
        <button type="button" onClick={() => dispatch(markAllNotificationsAsRead())}>Mark all read</button>
      </div>
      {notifications.length > 0 ? (
        <ul className="np__list">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <button type="button" className={`np__item ${notification.isRead ? '' : 'is-new'}`} onClick={() => handleMarkAsRead(notification)}>
                <span className="np__dot" aria-hidden="true" />
                <span>
                  <span className="np__title">{notification.title}</span>
                  <span className="np__desc">{notification.description}</span>
                  <span className="np__time">{notification.time}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="np__empty">You are all caught up. New messages and bids will show up here.</div>
      )}
    </div>
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
            src={brandLogo}
            alt="Logo"
            sx={{ height: 38, objectFit: 'contain' }}
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
        <NavSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

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
              src={brandLogo}
              alt="Rewind & Revive"
              sx={{ height: 38, objectFit: 'contain' }}
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
