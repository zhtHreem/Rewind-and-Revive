import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography, Avatar, Tabs, Tab, Box } from '@mui/material';
import Badges from './badges';
import Layout from '../Layout/layout';
import { useParams } from 'react-router-dom';
import SkeletonLoader from '../Utils/skeletonLoader';
const ProductTab = lazy(() => import('./ProductTab'));
const Dashboard = lazy(() => import('./Dashboard'));

const ProfileSkeleton = () => (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
          <SkeletonLoader width={150} height={150} style={{ borderRadius: '50%', margin: 'auto' }} />
          <SkeletonLoader.Text lines={1} width="60%" />
        </Paper>
        <Paper elevation={3} sx={{ my: 2, padding: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            {Array(4).fill(0).map((_, i) => (
              <SkeletonLoader key={i} width="40px" height="40px" style={{ borderRadius: '50%' }} />
            ))}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ padding: 2 }}>
          <SkeletonLoader.Text lines={1} width="40%" />
          <SkeletonLoader.Text lines={1} width="60%" />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <SkeletonLoader height="40px" width="100px" />
            <SkeletonLoader height="40px" width="100px" />
          </Box>
          <Box sx={{ padding: 2 }}>
            <SkeletonLoader.Text lines={3} width="100%" />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  </Container>
);

const UserProfilePage = () => {
  const { id } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
       
        if (!token) {
          alert("You Need to LogIn!");
          setLoading(false);
          return;
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = id || decodedToken.id;

        const response = await axios.get(`${process.env.REACT_APP_LOCAL_URL}/api/user/profile/${userId}`, {
          headers: { Authorization: token }
        });

       
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        alert("Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Layout>
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (!userData) {
    return <Typography>Error loading user data.</Typography>;
  }

  const { sellerBadges, userBadges } = userData;

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
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

          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ padding: 0 }}>
              <Typography sx={{ padding: 4 }}variant="h4">{userData.username}</Typography>
              {/* <Typography variant="subtitle1" color="textSecondary">
                Email: {userData.email}
              </Typography> */}
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="user profile tabs" sx={{ mt: 2 }}  TabIndicatorProps={{style: {  backgroundColor: '#8C5367'  }}}>
                <Tab label="Stats" />
                <Tab label="Products" />
              </Tabs>

              <Box sx={{ padding: 2 }}>
                {tabValue === 0 && (
                  <Suspense fallback={<SkeletonLoader.Text lines={6} />}>
                    <Dashboard userId={userData.id} />
                  </Suspense>
                )}
                {tabValue === 1 && (
  <Suspense fallback={<SkeletonLoader.Text lines={6} />}>
    <ProductTab />
  </Suspense>
)}

              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default UserProfilePage;
