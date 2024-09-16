import React, { useState } from 'react';
import { Paper, Typography, Box, Tabs, Tab, Grid, Card, CardContent, CardHeader, CardMedia, Button } from '@mui/material';

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
    { name: 'Market Leader', Description: 'Sold 100 Items', image: require('./badges/startseller.png') },
    { name: 'Popularity Pro', Description: 'Received 100 Likes', image: require('./badges/startseller.png') },
    { name: 'Top Seller', Description: 'Received 500 Likes', image: require('./badges/startseller.png') },
    { name: 'Customer Choice', Description: 'Achieved 5-Star Rating', image: require('./badges/startseller.png') }
  ];

  const userBadges = [
    { name: 'First Purchase', Description: 'Bought 1 Item', image: require('./badges/startseller.png') },
    { name: 'Frequent Buyer', Description: 'Bought 10 Items', image: require('./badges/startseller.png') },
    { name: 'Loyal Shopper', Description: 'Bought 25 Items', image: require('./badges/startseller.png') },
    { name: 'Big Spender', Description: 'Bought 50 Items', image: require('./badges/startseller.png') },
    { name: 'Ultimate Collector', Description: 'Bought 100 Items', image: require('./badges/startseller.png') },
    { name: 'Shopping Spree', Description: 'Spent $500', image: require('./badges/startseller.png') }
  ];

  const badges = tabValue === 0 ? sellerBadges : userBadges;

  // Only show the first 2 badges initially, and all if "Show More" is clicked
  const displayedBadges = showMore ? badges : badges.slice(0, 2);

  return (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="badges tabs">
        <Tab label="Seller Badges" />
        <Tab label="User Badges" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">
          {tabValue === 0 ? 'Seller Badges' : 'User Badges'}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {displayedBadges.map((badge, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="100"
                  image={badge.image}
                  alt={badge.name}
                />
                <CardHeader
                  title={badge.name}
                  subheader={badge.Description}
                />
              </Card>
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
