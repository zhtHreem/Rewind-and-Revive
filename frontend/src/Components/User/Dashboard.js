// Dashboard.js
import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import './Dashboard.css';

const Dashboard = ({ stats }) => {
  const {
    productsSold,
    itemsBought,
    totalSpent,
    totalEarned,
    totalListed,
    likesReceived,
    starRatings,
  } = stats;

  // Seller badge logic and next milestone
  let sellerBadge = '';
  let nextSellerMilestone = 10 - productsSold % 10;
  if (productsSold >= 100) {
    sellerBadge = 'Market Leader / Popularity Pro';
    nextSellerMilestone = 0; // Maxed out
  } else if (productsSold >= 50) {
    sellerBadge = 'Rising Star';
    nextSellerMilestone = 100 - productsSold;
  } else if (productsSold >= 10) {
    sellerBadge = 'Starter Seller';
    nextSellerMilestone = 50 - productsSold;
  }

  // Likes badge logic and next milestone
  let popularityBadge = '';
  let nextLikesMilestone = 500 - likesReceived;
  if (likesReceived >= 500) popularityBadge = 'Top Seller';

  // Ratings badge logic and next milestone
  let ratingBadge = starRatings >= 5 ? 'Customer Choice' : '';
  let nextRatingMilestone = 5 - starRatings;

  // User badge logic and next milestone
  let userBadge = '';
  let nextBuyerMilestone = 1 - itemsBought;
  if (itemsBought >= 25) {
    userBadge = 'Loyal Shopper';
    nextBuyerMilestone = 0; // Maxed out
  } else if (itemsBought >= 10) {
    userBadge = 'Frequent Buyer';
    nextBuyerMilestone = 25 - itemsBought;
  } else if (itemsBought >= 1) {
    userBadge = 'First Purchase';
    nextBuyerMilestone = 10 - itemsBought;
  }

  return (
    <Box className="dashboard-container">
      <Grid container spacing={3}>
        {/* Seller Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper effect-section same-size">
            <Typography variant="h6">Products Sold</Typography>
            <Typography variant="h4" className="dashboard-value">{productsSold}</Typography>
            <Typography variant="subtitle2">Out of {totalListed} Listed</Typography>
            {sellerBadge && (
              <Typography variant="subtitle2" className="badge-earned">
                {sellerBadge} Badge Earned!
              </Typography>
            )}
            <Typography variant="caption" className="milestone-text">
              {nextSellerMilestone > 0
                ? `Need ${nextSellerMilestone} more sales for the next badge`
                : 'Max milestone achieved!'}
            </Typography>
          </Paper>
        </Grid>

        {/* Likes and Ratings Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper effect-section same-size">
            <Typography variant="h6">Likes Received</Typography>
            <Typography variant="h4" className="dashboard-value">{likesReceived}</Typography>
            {popularityBadge && (
              <Typography variant="subtitle2" className="badge-earned">
                {popularityBadge} Badge Earned!
              </Typography>
            )}
            <Typography variant="caption" className="milestone-text">
              {nextLikesMilestone > 0
                ? `Need ${nextLikesMilestone} more likes for the next badge`
                : 'Max milestone achieved!'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper effect-section same-size">
            <Typography variant="h6">5-Star Ratings</Typography>
            <Typography variant="h4" className="dashboard-value">{starRatings}</Typography>
            {ratingBadge && (
              <Typography variant="subtitle2" className="badge-earned">
                {ratingBadge} Badge Earned!
              </Typography>
            )}
            <Typography variant="caption" className="milestone-text">
              {nextRatingMilestone > 0
                ? `Need ${nextRatingMilestone} more 5-star ratings for next milestone`
                : 'Max milestone achieved!'}
            </Typography>
          </Paper>
        </Grid>

        {/* User Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper effect-section same-size">
            <Typography variant="h6">Items Bought</Typography>
            <Typography variant="h4" className="dashboard-value">{itemsBought}</Typography>
            {userBadge && (
              <Typography variant="subtitle2" className="badge-earned">
                {userBadge} Badge Earned!
              </Typography>
            )}
            <Typography variant="caption" className="milestone-text">
              {nextBuyerMilestone > 0
                ? `Need ${nextBuyerMilestone} more purchases for the next badge`
                : 'Max milestone achieved!'}
            </Typography>
          </Paper>
        </Grid>

        {/* Total Earned */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper text-effect-section same-size">
            <Typography variant="h6">Total Earned</Typography>
            <Typography variant="h4" className="text-effect">${totalEarned}</Typography>
          </Paper>
        </Grid>

        {/* Total Spent */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper text-effect-section same-size">
            <Typography variant="h6">Total Spent</Typography>
            <Typography variant="h4" className="text-effect">${totalSpent}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
