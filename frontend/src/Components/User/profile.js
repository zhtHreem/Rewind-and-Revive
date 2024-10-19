import React from 'react';
import { Container, Grid, Paper, Typography, Avatar, Tabs, Tab, Box } from '@mui/material';
import Badges from './badges';
import Layout from '../Layout/layout';
import Dashboard from './Dashboard'; // Import Dashboard component

const UserProfilePage = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Example stats data
  const stats = {
    productsSold: 75,
    totalListed: 100,
    itemsBought: 20,
    totalSpent: 950,
    totalEarned: 1350,
    likesReceived: 520,
  };

  // Reviews data for the ratings bar graph
  const reviewsData = {
    fiveStar: 320,
    fourStar: 150,
    threeStar: 50,
    twoStar: 30,
    oneStar: 20,
  };

  // Monthly sales data
  const monthlySales = [
    { month: 'January', value: 50 },
    { month: 'February', value: 75 },
    { month: 'March', value: 60 },
    { month: 'April', value: 80 },
    { month: 'May', value: 90 },
    { month: 'June', value: 100 },
    { month: 'July', value: 85 },
    { month: 'August', value: 70 },
    { month: 'September', value: 95 },
    { month: 'October', value: 110 },
    { month: 'November', value: 130 },
    { month: 'December', value: 120 },
  ];

  const topSellerRank = 10; // Example rank: Top 10%

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
                  src={require("./images/user.png")}
                  sx={{ width: 150, height: 150, margin: 'auto' }}
                />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  User
                </Typography>
              </Paper>
              <Paper elevation={3} sx={{ my: 2, padding: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <Badges />
                </Box>
              </Paper>
            </Grid>

            {/* Right Block */}
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ padding: 2 }}>
                <Typography variant="h4">User Name</Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  User's info goes here. This section can include details such as bio, location, and other relevant information.
                </Typography>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="user profile tabs" sx={{ mt: 2 }}>
                  <Tab label="Info" />
                  <Tab label="Stats" />
                  <Tab label="Products" />
                </Tabs>
                <Box sx={{ padding: 2 }}>
                  {tabValue === 0 && <Typography>Info Tab Content</Typography>}
                  {tabValue === 1 && (
                    <Dashboard 
                      stats={stats} 
                      reviewsData={reviewsData} 
                      monthlySales={monthlySales}
                      topSellerRank={topSellerRank}
                    />
                  )}
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
