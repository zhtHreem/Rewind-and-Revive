import React from 'react';
import { Container, Grid, Paper, Typography, Avatar, Tabs, Tab, Box } from '@mui/material';
import Badges from './badges';
import Layout from '../Layout/layout';
const UserProfilePage = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
              src={require("./images/woman.png")}
              sx={{ width: 150, height: 150, margin: 'auto' }}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>
              User
            </Typography>

          </Paper>  
          <Paper elevation={3} sx={{ my:2,padding: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              {/* Example badges */}
             <Badges/>
            </Box>
          </Paper>
        </Grid>

        {/* Right Block */}
        <Grid item xs={12} md={8} my={{sm:2,md:0}}>
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
              {tabValue === 1 && <Typography>Stats Tab Content</Typography>}
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
