import React, { useState,useEffect } from "react"; 
import { useNavigate } from 'react-router-dom'; 
import { Paper, Box, TextField, IconButton, Typography, Stack, Button, useMediaQuery, useTheme } from "@mui/material"; 
import { GoogleLogin } from '@react-oauth/google';

import EmailIcon from '@mui/icons-material/Email'; 
import LockIcon from '@mui/icons-material/Lock'; 
import CloseIcon from '@mui/icons-material/Close'; 
import { Link } from "react-router-dom"; 
import Snackbar from '@mui/material/Snackbar'; 
import Alert from '@mui/material/Alert'; 
import axios from 'axios'; 

// Image Imports 
import NewProductImage from './images/new-product.png'; 
import ArtificialIntelligenceImage from './images/artificial-intelligence.png'; 
import ShoppingOnlineImage from './images/shopping-online.png'; 
import ThriftShopImage from './images/thrift-shop.png'; 
import TrolleyImage from './images/trolley.png'; 
import BidImage from './images/bid.png'; 
import ShoppingCartImage from './images/shopping-cart.png'; 
import ShoppingImage from './images/shopping.png'; 
import TalkingImage from './images/talking.png'; 
import RobotImage from './images/robot.png'; 
import OnlineShopImage from './images/online-shop.png';

function Login({ setLogin }) { 
    const navigate = useNavigate(); 
    const theme = useTheme(); 
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); 

    // State Management 
    const [openSnackbar, setOpenSnackbar] = useState(false); 
    const [snackbarMessage, setSnackbarMessage] = useState(''); 
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 
    const [signup, setSignup] = useState(false); 
    
    // Login Form States 
    const [loginEmail, setLoginEmail] = useState(''); 
    const [loginPassword, setLoginPassword] = useState(''); 
    
    // Signup Form States 
    const [signupUsername, setSignupUsername] = useState(''); 
    const [signupEmail, setSignupEmail] = useState(''); 
    const [signupPassword, setSignupPassword] = useState(''); 
    const [signupConfirmPassword, setSignupConfirmPassword] = useState(''); 
    const [errorMessage, setErrorMessage] = useState('');
    

    
    // Snackbar Close Handler 
    const handleCloseSnackbar = (event, reason) => { 
        if (reason === 'clickaway') return; 
        setOpenSnackbar(false); 
    };

    // Login Handler 
    const handleLogin = async () => { 
        const loginData = { email: loginEmail, password: loginPassword }; 
        try { 
            const response = await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/user/login`, loginData); 
            console.log("s",response)
            localStorage.setItem('token', response.data.token);
            setSnackbarMessage('Login successful!'); 
            setSnackbarSeverity('success'); 
            setOpenSnackbar(true); 
        } catch (err) { 
            setErrorMessage('Invalid email or password'); 
            setSnackbarMessage(err.response?.data?.message || 'Login error'); 
            setSnackbarSeverity('error'); 
            setOpenSnackbar(true); 
        } 
    };
    
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Send the Google token to your backend for verification and login
            const response = await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/user/google-login`, {
                token: credentialResponse.credential
            });
               console.log("kkk",response.data)
            // Handle successful login
            localStorage.setItem('token', response.data.token);
            setSnackbarMessage('Google Login successful!');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            
            // Optional: Redirect or update app state
            // navigate('/dashboard');
        } catch (err) {
            setSnackbarMessage('Google Login failed');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };
    // Signup Handler 
    const handleSignup = async () => { 
        if (signupPassword !== signupConfirmPassword) { 
            setErrorMessage('Passwords do not match'); 
            return; 
        } 
        const signupData = { username: signupUsername, email: signupEmail, password: signupPassword }; 
        try { 
            const response = await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/user/register`, signupData, { headers: { 'Content-Type': 'application/json' } }); 
            setSnackbarMessage(response.message,'Signup successful!'); 
            setSnackbarSeverity('success'); 
            setOpenSnackbar(true); 
            setSignup(false); 
        } catch (err) { 
            setErrorMessage('Signup failed'); 
            setSnackbarMessage(err.response?.data?.message || 'Signup error'); 
            setSnackbarSeverity('error'); 
            setOpenSnackbar(true); 
        } 
    };

        // Decorative Images State
    const [visibleIndexes, setVisibleIndexes] = useState([]);
       const imageConfigs = [
            { src: NewProductImage, top: "5%", left: "1%" },
            { src: ArtificialIntelligenceImage, top: "30%", left: "-8%" },
            { src: ShoppingOnlineImage, top: "55%", left: "-8%" },
            { src: TrolleyImage, top: "80%", left: "3%" },
            { src: BidImage, top: "90%", left: isMobile ? "-10%" : "43%" },
            { src: ShoppingCartImage, top: "80%", left: "70%" },
            { src: ShoppingImage, top: "55%", left: "85%" },
            { src: TalkingImage, top: "30%", left: "90%" },
            { src: RobotImage, top: "5%", left: "85%" },
            { src: OnlineShopImage, top: "-10%", left: "45%" },
        ];
    // useEffect for decorative images visibility
    useEffect(() => {
     

        const timeouts = imageConfigs.map((_, index) =>
            setTimeout(() => setVisibleIndexes((prev) => [...prev, index]), index * 300) // 300ms delay between icons
        );
          return () => timeouts.forEach(clearTimeout); // Clear timeouts on unmount
    }, []);



    // Decorative Images Renderer 
    const renderDecorativeImages = () => { 
  
        return imageConfigs.map((config, index) => ( 
            <Box key={index} component="img" src={config.src} sx={{ width: { xs: '1vw', md: "5vw" }, height: { xs: '1vh', md: "10vh" }, position: "absolute", top: config.top, left: config.left, zIndex: 1, userSelect: 'none', pointerEvents: 'none', display: { xs: 'none', md: 'block' },  opacity: visibleIndexes.includes(index) ? 1 : 0, transition: 'opacity 0.5s ease-in-out', }} /> 
        )); 
    };

    return ( 
        <Box sx={{ position: 'relative', zIndex: 200, border: "solid grey", backgroundColor: 'rgba(0, 0, 0, 0.5)', boxShadow: 20, width: { xs: "100%", sm: "95%", md: "80%" }, height: { xs: "100%", sm: "90%" }, margin: 'auto', top: { sm: "5%" } }}> 
            <Paper sx={{ p: { xs: 2, md: 6 }, backgroundColor: 'white', overflow: 'auto', height: "100%", display: 'flex', flexDirection: { xs: 'column', md: 'row' } }} elevation={24}> 
                <IconButton onClick={() => setLogin(false)} sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}><CloseIcon /></IconButton> 
                <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'center', horizontal: 'center' }}> 
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert> 
                </Snackbar> 
                <Stack direction={{ xs: "column", md: "row" }} sx={{ width: '100%', height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Image Section */} 
                    <Box sx={{ width: { xs: '100%', md: '60%' }, height: { xs: '200px', md: '100%' }, position: 'relative', borderRight: '2px dotted #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> 
                        <Paper sx={{ backgroundColor: "black", borderRadius: { xs: "10%", md: '90%' }, height: { xs: '200px', md: '60%' }, width: { xs: '200px', md: '60%' }, position: 'relative' }} elevation={24}> 
                            <Box component="img" src={ThriftShopImage} sx={{ width: { xs: '150px', md: '20vw' }, height: { xs: '150px', md: '30vh' }, position: "absolute", top: "20%", left: "9%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} /> 
                            {!isMobile && renderDecorativeImages()} 
                        </Paper> 
                    </Box> 
                    {/* Form Section */} 
                    <Stack sx={{ width: { xs: "100%", md: "40%" }, padding: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}> 
                        {!signup ? ( 
                            <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}> 
                                <Typography variant="h4" align="center" sx={{ mb: 2 }}>Login</Typography> 
                                <TextField fullWidth label="Email" variant="outlined" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1 }} /> }} /> 
                                <TextField fullWidth label="Password" type="password" variant="outlined" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} InputProps={{ startAdornment: <LockIcon sx={{ mr: 1 }} /> }} /> 
                                <Button fullWidth variant="contained" sx={{ backgroundColor: '#85586F', '&:hover': { backgroundColor: '#6D4C5B' } }} onClick={handleLogin}>Log In</Button> 
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                  <GoogleLogin onSuccess={handleGoogleSuccess}  onError={() => console.log('Login Failed')} type="standard"  theme="filled_blue" size="large" text="signin_with"   shape="rectangular" />
                                </Box>
                                <Typography variant="body2" sx={{ textAlign: 'center' }}>Don't have an account? 
                                    <Link onClick={() => setSignup(true)} sx={{ cursor: 'pointer' }}>Sign Up</Link> 
                                </Typography> 
                                
                            </Stack> 
                        ) : ( 
                            <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}> 
                                <Typography variant="h4" align="center" sx={{ mb: 2 }}>Sign Up</Typography> 
                                <TextField fullWidth label="Username" variant="outlined" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} /> 
                                <TextField fullWidth label="Email" variant="outlined" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} /> 
                                <TextField fullWidth label="Password" type="password" variant="outlined" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} /> 
                                <TextField fullWidth label="Confirm Password" type="password" variant="outlined" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} /> 
                                {errorMessage && <Typography color="error">{errorMessage}</Typography>} 
                                <Button fullWidth variant="contained" sx={{ backgroundColor: '#85586F', '&:hover': { backgroundColor: '#6D4C5B' } }} onClick={handleSignup}>Sign Up</Button> 
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                  <GoogleLogin onSuccess={handleGoogleSuccess}  onError={() => console.log('Login Failed')} type="standard"  theme="filled_blue" size="large" text="signin_with"   shape="rectangular" />
                                </Box>                              
                                <Typography  variant="body2"    align="center"  onClick={() => setSignup(false)}  sx={{   cursor: 'pointer', color: 'primary.main'  }}  >
                                    Already have an account? Login
                                </Typography>
                            </Stack> 
                        )}
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    ); 
}

export default Login;
