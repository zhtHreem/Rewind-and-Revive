import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Tabs, Tab, Grid, Card, Badge,CardContent,Tooltip, CardHeader, CardMedia, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'axios';

const Badges = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showMore, setShowMore] = useState(false); // Control show more/less
    const [badgesData, setBadgesData] = useState({
  sellerBadges: [],
  userBadges: []
});


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setShowMore(false); // Reset when changing tabs
  };

  const toggleShowMore = () => {
    setShowMore((prevShowMore) => !prevShowMore);
  };

   useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response =await axios.get(`http://localhost:5000/api/user/badges`,{headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token') 
                }});
      
        setBadgesData(response.data);
        console.log('Badges data:',badgesData);
      } catch (err) {
        console.error('Error fetching badges:', err);
      }
    };

    fetchBadges();
  }, []);

  const badgeImages = {
  'Starter Seller': require('./badges/startseller.png'),
  'Rising Star': require('./badges/star.png'),
  'Market Leader': require('./badges/marketleader.png'),
  'Popularity Pro': require('./badges/popularitypro.png'),
  'Top Seller': require('./badges/sell.png'),
  'Customer Choice': require('./badges/bestseller.png'),
  'First Purchase': require('./badges/firstpurchase.png'),
  'Frequent Buyer': require('./badges/frequentpurchase.png'),
  'Loyal Shopper': require('./badges/loyalshopper.png'),
  'Big Spender': require('./badges/bigspender.png'),
  'Ultimate Collector': require('./badges/ultimatecollector.png'),
  'Shopping Spree': require('./badges/shoppingspree.png'),
};


  const badges = tabValue === 0 ? badgesData.sellerBadges || [] : badgesData.userBadges || [];
  // Only show the first 2 badges initially, and all if "Show More" is clicked
  const displayedBadges = showMore ? badges : badges.slice(0, 3);

  return (
    <Paper  elevation={3} sx={{ padding: 2}}>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="badges tabs">
        <Tab label="Seller Badges" />
        <Tab label="User Badges" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
       

        

        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {displayedBadges.map((badge, index) => (
             
            <Grid item xs={12} sm={6} md={4} key={index}sx={{ height: '200px', width: '100%' }}>
            <Tooltip title={badge.Description}>
             <Badge
                color="primary"
                badgeContent={badge.level} // For gamification, level or rank can be shown here
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                
              >
              <Card sx={{ height: '150px', width: '100%' }}>
              <Card sx={{ borderRadius: '16px' }}>
               {badge.isAchieved ? (
                 <CardMedia
                      component="img"
                      sx={{  height: 50, width: 80,objectFit: 'contain',boxShadow: 8,border: '2px solid #FFD700',  borderRadius: 2, p: 1,backgroundColor: '#fff', }}
                      image={badgeImages[badge.name]}
                      alt={badge.name}
                      />
               ) : (
                  <>
                 <CardMedia
                      component="img"
                      sx={{ height: 50, width: 80, objectFit: 'contain', filter: 'grayscale(100%)', opacity: 0.5,  cursor: 'not-allowed', boxShadow: 1,   borderRadius: 2, }}
                      image={badgeImages[badge.name]}   alt="Locked Badge"/>
                  </>
                 )}

                </Card>
                <CardHeader color='black'
                  subheader={badge.name}
               
                />
              </Card>
              </Badge>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={toggleShowMore} sx={{backgroundColor:'#85586F',color:"white"}}>
            {showMore ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Badges;
