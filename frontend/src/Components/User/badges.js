import React, { useState } from 'react';
import { Paper, Typography, Box, Tabs, Tab, Grid, Card, Badge,CardContent,Tooltip, CardHeader, CardMedia, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
const Badges = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showMore, setShowMore] = useState(false); // Control show more/less

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setShowMore(false); // Reset when changing tabs
  };

  const toggleShowMore = () => {
    setShowMore((prevShowMore) => !prevShowMore);
  };

  const sellerBadges = [
    { name: 'Starter Seller', Description: 'Sold 10 Items', image: require('./badges/startseller.png') },
    { name: 'Rising Star', Description: 'Sold 50 Items', image: require('./badges/star.png') },
    { name: 'Market Leader', Description: 'Sold 100 Items', image: require('./badges/marketleader.png') },
    { name: 'Popularity Pro', Description: 'Received 100 Likes', image: require('./badges/popularitypro.png') },
    { name: 'Top Seller', Description: 'Received 500 Likes', image: require('./badges/sell.png') },
    { name: 'Customer Choice', Description: 'Achieved 5-Star Rating', image: require('./badges/bestseller.png') }
  ];

  const userBadges = [
    { name: 'First Purchase', Description: 'Bought 1 Item', image: require('./badges/firstpurchase.png') },
    { name: 'Frequent Buyer', Description: 'Bought 10 Items', image: require('./badges/frequentpurchase.png') },
    { name: 'Loyal Shopper', Description: 'Bought 25 Items', image: require('./badges/loyalshopper.png') },
    { name: 'Big Spender', Description: 'Bought 50 Items', image: require('./badges/bigspender.png') },
    { name: 'Ultimate Collector', Description: 'Bought 100 Items', image: require('./badges/ultimatecollector.png') },
    { name: 'Shopping Spree', Description: 'Spent $500', image: require('./badges/shoppingspree.png') }
  ];

  const badges = tabValue === 0 ? sellerBadges : userBadges;

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
                <CardMedia
                  component="img"
                   sx={{ height: 50, width: 80, objectFit: 'contain' }} // Fixed size and scale the image properly

                  image={badge.image}
                  alt={badge.name}
                />
                </Card>
                <CardHeader
                  subheader={badge.name}
               
                />
              </Card>
              </Badge>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={toggleShowMore}>
            {showMore ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Badges;
