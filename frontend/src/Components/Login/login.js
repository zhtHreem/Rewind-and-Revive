import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Paper, Box, TextField, IconButton, Typography, Stack, Button,Badge } from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from "react-router-dom";

function Login({ setLogin }) {
    const navigate = useNavigate();
    const [signup, setSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleLogin = () => {
        // Placeholder for login logic
        console.log("Login clicked");
    };

    const handleSignup = () => {
        // Placeholder for signup logic
        console.log("Signup clicked");
    };

    return (
        <Box sx={{ position: 'relative', zIndex: 2,border:"solid grey", backgroundColor: '/*rgba(0, 0, 0, 0.5)*/', width: { xs: "100%", sm: "90%", md: "80%" }, top: { sm: "5%" }, left: { sm: "5%", md: "10%" }, overflow: 'hidden' }}>
            <Paper sx={{ p: { xs: 3, md: 6 }, height: "80vh",backgroundColor: '#F3F7EC' }} elevation={24}>
                <IconButton onClick={() => setLogin(false)}>
                    <CloseIcon />
                </IconButton>
                <Stack direction="row" sx={{ height: "100%" }}>
                    <Box sx={{ backgroundColor: "#F3F7EC",borderRight:"dotted" , width: { xs: "55%", sm: "60%" },  display: 'flex',justifyContent:"center",alignItems:"center", position: 'relative', }}>
                    
                      <Paper elevation={24} sx={{ backgroundColor: "black", borderRadius: { xs: "0% 100% 9% 91% / 0% 64% 36% 100%", md: '50%' },height:"70%",width:"60%"}}>
                    
                        <Box component="img" src={require("./images/new-product.png")} sx={{ width: { xs: '5vw' }, height: {xs:"10vh"}, position: "absolute", top: "15%", left: "25%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />
                        <Box component="img" src={require("./images/artificial-intelligence.png")} sx={{ width: { xs: '5vw' }, height: {xs:"10vh"}, position: "absolute", top: "30%", left: "15%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />
                        <Box component="img" src={require("./images/shopping-online.png")} sx={{ width: { xs: '5vw' }, height: {xs:"10vh"}, position: "absolute", top: "50%", left: "14%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />
                      
                      
                               <Box component="img" src={require("./images/thrift-shop.png")} sx={{ width: { xs: '20vw' }, height: {xs:"35vh"}, position: "absolute", top: "25%", left: "25%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />

                      
                        <Box component="img" src={require("./images/trolley.png")} sx={{ width: { xs: '5vw' }, height: {xs:"10vh"}, position: "absolute", top: "70%", left: "23%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />                  
                        <Box component="img" src={require("./images/bid.png")} sx={{ width: { xs: '90vw', md: '5vw' }, height: { xs: "90vh", md: "10vh" }, objectFit: 'contain', position: "absolute", top: { xs: "0%", md: "75%" }, left: { xs: "-10%", md: "-50%", lg: "43%" }, zIndex: 2, userSelect: 'none', pointerEvents: 'none' }} />
                        <Box component="img" src={require("./images/shopping-cart.png")} sx={{ width: { xs: '5vw' }, height: {xs:"10vh"}, position: "absolute", top: "70%", left: "60%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />
                        <Box component="img" src={require("./images/shopping.png")} sx={{ width: { xs: '5vw' }, height: {xs:"10vh"}, position: "absolute", top: "50%", left: "70%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />
                        <Box component="img" src={require("./images/talking.png")} sx={{ width: { xs: '5vw' }, height: {xs:"10vh"}, position: "absolute", top: "30%", left: "70%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />

                        <Box component="img" src={require("./images/robot.png")} sx={{ width: { xs: '5vw' }, height: {xs:"10vh"}, position: "absolute", top: "15%", left: "60%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />            
                        <Box component="img" src={require("./images/online-shop.png")} sx={{ width: { xs: '5vw' }, height: {xs:"10vh"}, position: "absolute", top: "10%", left: "45%", zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />
                      
                      
                      
                     
                   
                      
                       </Paper>
                    </Box>


                    {!signup && (
                        <Stack paddingLeft={3} alignItems="center" paddingTop={8} spacing={2} sx={{ width: "40%", height: "100%", zIndex: 3 }}>
                            <Typography variant="h3" paddingBottom={7} sx={{fontWeight:"bold"}}>Login</Typography>
                            <TextField id="outlined-basic" label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)}
                                InputProps={{ startAdornment: (<EmailIcon sx={{ mr: 1 }} />) }} />
                            <TextField id="outlined-basic" label="Password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)}
                                InputProps={{ startAdornment: (<LockIcon sx={{ mr: 1 }} />) }} sx={{ paddingBottom: 3 }} />
                            <Typography component={Link} variant="caption" paddingLeft={{ xs: 5, md: 15, lg: 20 }}>Forget Password</Typography>
                            <Button sx={{backgroundColor: '#3B3486','&:hover': { backgroundColor: 'white',color:"#3B3486" }, color: "white", p: 2, width: "60%" }} onClick={handleLogin}>Log In</Button>
                            <Typography component={Link} variant="caption" onClick={() => setSignup(true)}>Create New Account</Typography>
                        </Stack>
                    )}

                    {signup && (
                        <Stack paddingLeft={3} alignItems="center" paddingTop={1} spacing={2} sx={{ width: "40%", height: "100%", zIndex: 3 }}>
                            <Typography variant="h3" paddingBottom={4}>Create New Account</Typography>
                            <TextField id="outlined-basic" label="Username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)}
                                InputProps={{ startAdornment: (<EmailIcon sx={{ mr: 1 }} />) }} />
                            <TextField id="outlined-basic" label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)}
                                InputProps={{ startAdornment: (<EmailIcon sx={{ mr: 1 }} />) }} />
                            <TextField id="outlined-basic" label="Password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)}
                                InputProps={{ startAdornment: (<LockIcon sx={{ mr: 1 }} />) }} sx={{ paddingBottom: 1 }} />
                            <TextField id="outlined-basic" label="Confirm Password" variant="outlined" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                InputProps={{ startAdornment: (<LockIcon sx={{ mr: 1 }} />) }} sx={{ paddingBottom: 2 }} />
                            <Button sx={{backgroundColor: '#3B3486','&:hover': { backgroundColor: 'black', }, color: "white", p: 2, width: "60%" }} onClick={handleSignup}>Sign Up</Button>

                            <Typography component={Link} variant="caption" onClick={() => setSignup(false)}>Login</Typography>
                        </Stack>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}

export default Login;
