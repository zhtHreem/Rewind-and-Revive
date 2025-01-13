import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography, Avatar, Tabs, Tab, Box } from '@mui/material';
import Badges from './badges';
import Layout from '../Layout/layout';
import Dashboard from './Dashboard';
import { useParams } from 'react-router-dom';


const UserProfilePage = () => {
  const { id } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Frontend Token:", token);
    
        if (!token) {
          alert("Token is missing!");
          setLoading(false);  // ✅ Stop loading when token is missing
          return;
        }
    
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = id || decodedToken.id;
    
        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/user/profile/${userId}`, {
          headers: { Authorization: token } 
      });
      
        console.log("Frontend API Response:", response.data);
        setUserData(response.data);
        setLoading(false);  // ✅ Stop loading once data is fetched successfully
      } catch (error) {
        console.error("❌ Frontend Error Fetching User Data:", error);
        alert("Failed to fetch user data");
        setLoading(false);  // ✅ Stop loading on error too
      }
    };
    
    fetchUserData();
}, [id]);



  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!userData) {
    return <Typography>Error loading user data.</Typography>;
  }

  const { sellerBadges, userBadges } = userData;

  return (
    <>
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* Left Block */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                <Avatar
                  alt="Profile Image"
                  src={require('./images/user.png')}
                  sx={{ width: 150, height: 150, margin: 'auto' }}
                />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {userData.username}
                </Typography>
              </Paper>
              <Paper elevation={3} sx={{ my: 2, padding: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <Badges badges={sellerBadges.concat(userBadges)} />
                </Box>
              </Paper>
            </Grid>

            {/* Right Block */}
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ padding: 2 }}>
                <Typography variant="h4">{userData.username}</Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Email: {userData.email}
                </Typography>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="user profile tabs" sx={{ mt: 2 }}>
                  <Tab label="Info" />
                  <Tab label="Stats" />
                  <Tab label="Products" />
                </Tabs>
                <Box sx={{ padding: 2 }}>
                  {tabValue === 0 && <Typography>Info Tab Content</Typography>}
                  {tabValue === 1 && <Dashboard userId={userData.id} />}
                  {tabValue === 2 && <Typography>Products Tab Content</Typography>}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Layout>
    </>
  );
};

export default UserProfilePage;
