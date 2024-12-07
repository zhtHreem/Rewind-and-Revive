import React, { useState } from "react";

import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Stack, Link, Box, IconButton, Typography, Button, Drawer } from "@mui/material";
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu'; // Menu button icon
import { useLogin } from "../Login/logincontext";
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddCart from "../ShoppingCart/AddCart";
import AddIcon from '@mui/icons-material/Add';
import NewProduct from "../Product/createNewProduct";

function Navbar() {
  const navigate = useNavigate();
  const [shoppingCart, setShoppingCart] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [login, setLogin] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const[addProduct,setAddProduct]=useState(false);
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
  const handleAddProductClick = () => {
    setAddProduct(true); // Set addProduct to true when the button is clicked
  };

  const performSearch = () => {
    // Your search functionality here
  };

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
         {/*  {addProduct &&(
              <NewProduct setAddProduct={setAddProduct}/>
            )             
            }
            */} 
          </IconButton>
          {!login && (
            <>
            <IconButton onClick={() => navigate("/profile")}>
              <PersonIcon />
            </IconButton>

            <IconButton>
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
