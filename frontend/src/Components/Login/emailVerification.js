import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { green } from '@mui/material/colors';
import { red } from '@mui/material/colors';
import { blue } from '@mui/material/colors';
import axios from 'axios';

function EmailVerification() {
    const [verificationStatus, setVerificationStatus] = useState({
        loading: true,
        success: false,
        alreadyVerified: false,
        message: ''
    });

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const token = searchParams.get('token');
               ;

                if (!token) {
                    setVerificationStatus({
                        loading: false,
                        success: false,
                        alreadyVerified: false,
                        message: 'No verification token provided.Please check your verification email and try again with a valid link.'
                    });
                    return;
                }

             
                const response = await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/user/verify-email`, { token });
                
                if (response.data.status === 'already_verified' || 
                    response.data.message.toLowerCase().includes('already verified') ||
                    response.data.message.toLowerCase().includes('already been verified')) {
                    setVerificationStatus({
                        loading: false,
                        success: false,
                        alreadyVerified: true,
                        message: response.data.message
                    });
                } else if (response.data.success || response.data.status === 'success') {
                    setVerificationStatus({
                        loading: false,
                        success: true,
                        alreadyVerified: false,
                        message: response.data.message
                    });
                } else {
                    setVerificationStatus({
                        loading: false,
                        success: false,
                        alreadyVerified: false,
                        message: response.data.message
                    });
                }

            } catch (error) {
                console.error("Verification Error:", error.response?.data); 
                setVerificationStatus({
                    loading: false,
                    success: false,
                    alreadyVerified: false,
                    message: error.response?.data?.message || 'Verification failed'
                });
            }
        };

        verifyEmail();
    }, []);

    const renderContent = () => {
        if (verificationStatus.loading) {
            return (
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Verifying your email...
                    </Typography>
                </Box>
            );
        }

        if (verificationStatus.alreadyVerified) {
            return (
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <InfoIcon sx={{  fontSize: 80,   color: blue[500],    mb: 2  }} />
                    <Alert    severity="info"  sx={{ mb: 3 }}  >
                        <AlertTitle>Already Verified</AlertTitle>
                        {verificationStatus.message}
                    </Alert>
                    <Button
                        variant="contained" color="primary"  size="large" fullWidth  href="/login" sx={{ mt: 2 }} >
                        Go to Login
                    </Button>
                </Box>
            );
        }

        if (verificationStatus.success) {
            return (
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <CheckIcon sx={{   fontSize: 80,  color: green[500],    mb: 2 }} />
                    <Alert 
                        severity="success"   sx={{ mb: 3 }}>
                        <AlertTitle>Success</AlertTitle>
                        {verificationStatus.message}
                    </Alert>
                    <Button variant="contained"  color="success"   size="large" fullWidth href="/" sx={{ mt: 2 }}  >
                        Proceed to Login
                    </Button>
                </Box>
            );
        }

        return (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
                <ErrorIcon sx={{    fontSize: 80,   color: red[500],  mb: 2 }} />
                <Alert  severity="error"   sx={{ mb: 3 }} >
                    <AlertTitle>Error</AlertTitle>
                    {verificationStatus.message}
                </Alert>
                <Button      variant="contained"  color="success" size="large"  fullWidth      href="/"  sx={{ mt: 2 }} >
                        Proceed to Login
                    </Button>
            </Box>
        );
    };

    return (
        <Container  maxWidth="sm"    sx={{ minHeight: '100vh',display: 'flex',alignItems: 'center', justifyContent: 'center',     py: 4 }} >
            <Paper  elevation={3}   sx={{ width: '100%',   p: 4,    display: 'flex', flexDirection: 'column',   alignItems: 'center',gap: 3  }}  >
                <Typography variant="h4" component="h1" gutterBottom>
                    Email Verification
                </Typography>

                {renderContent()}
            </Paper>
        </Container>
    );
}

export default EmailVerification;