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

  // Example stats data, in real usage this could be fetched from an API or database
  const stats = {
    productsSold: 75,         // Example: User sold 75 items
    itemsBought: 20,          // Example: User bought 20 items
    totalSpent: 950,          // Example: User spent $950
    totalEarned: 1350,        // Example: User earned $1350
    totalListed: 100,         // Example: User listed 100 items
    likesReceived: 520,       // Example: User received 520 likes
    starRatings: 5            // Example: User has a 5-star rating
  };
  
  

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
                  {/* Example badges */}
                  <Badges />
                </Box>
              </Paper>
            </Grid>

            {/* Right Block */}
            <Grid item xs={12} md={8} my={{ sm: 2, md: 0 }}>
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
                  {tabValue === 1 && <Dashboard stats={stats} />} {/* Render Dashboard in the Stats tab */}
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
