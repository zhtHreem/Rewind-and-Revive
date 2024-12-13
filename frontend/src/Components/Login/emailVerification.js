import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function EmailVerification() {
    const [verificationStatus, setVerificationStatus] = useState({
        loading: true,
        success: false,
        message: ''
    });

    const location = useLocation();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Extract token from URL query parameters
                const searchParams = new URLSearchParams(location.search);
                const token = searchParams.get('token');
                console.log("Verification token:", token);

                if (!token) {
                    setVerificationStatus({
                        loading: false,
                        success: false,
                        message: 'No verification token provided'
                    });
                    return;
                }

                const response = await axios.post('http://localhost:5000/api/user/verify-email', { token });

                setVerificationStatus({
                    loading: false,
                    success: true,
                    message: response.data.message
                });

                // Optionally store the token or redirect to login
                localStorage.setItem('token', response.data.token);
            } catch (error) {
                setVerificationStatus({
                    loading: false,
                    success: false,
                    message: error.response?.data?.message || 'Verification failed'
                });
            }
        };

        verifyEmail();
    }, [location]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            {verificationStatus.loading ? (
                <p>Verifying your email...</p>
            ) : verificationStatus.success ? (
                <div>
                    <h2 style={{ color: 'green' }}>Email Verified Successfully!</h2>
                    <p>{verificationStatus.message}</p>
                    <Link to="/" style={{ textDecoration: 'none', color: 'blue' }}>
                        Proceed to Login
                    </Link>
                </div>
            ) : (
                <div>
                    <h2 style={{ color: 'red' }}>Email Verification Failed</h2>
                    <p>{verificationStatus.message}</p>
                    <Link to="/signup" style={{ textDecoration: 'none', color: 'blue' }}>
                        Try Again
                    </Link>
                </div>
            )}
        </div>
    );
}

export default EmailVerification;
