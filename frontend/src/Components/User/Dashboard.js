import React, { useMemo } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, Divider } from '@mui/material';
import CountUp from 'react-countup'; // For animated number display
import { Line, Doughnut } from 'react-chartjs-2'; // Import Line and Doughnut Chart components from react-chartjs-2
import { Chart, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'; // Ensure proper registration of chart elements
import './Dashboard.css';

// Register necessary chart components to prevent re-rendering issues
Chart.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Rating bar component with linear progress
const RatingBar = ({ label, value, total }) => {
  const percentage = (value / total) * 100;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
      <Typography variant="body2" sx={{ width: '30px', fontWeight: 500 }}>{label}★</Typography>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          flex: 1,
          mx: 1,
          backgroundColor: '#f0f0f0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#ffc107',
          },
        }}
      />
      <Typography variant="body2" sx={{ width: '40px', fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
};

// Use memoization to avoid unnecessary re-renders of charts
const Dashboard = React.memo(({ stats = {}, monthlySales = [], reviewsData = {}, topSellerRank = 0 }) => {
  const {
    productsSold = 0,
    totalListed = 0,
    itemsBought = 0,
    totalSpent = 0,
    totalEarned = 0,
    likesReceived = 0,
  } = stats;

  const totalReviews = Object.values(reviewsData).reduce((acc, val) => acc + val, 0); // Sum of all star reviews
  const averageRating = (
    (5 * reviewsData.fiveStar + 
    4 * reviewsData.fourStar + 
    3 * reviewsData.threeStar + 
    2 * reviewsData.twoStar + 
    1 * reviewsData.oneStar) / totalReviews
  ).toFixed(1); // Calculate weighted average rating

  // Memoize salesData to prevent unnecessary recalculations
  const salesData = useMemo(() => ({
    labels: monthlySales.map((sale) => sale.month), // Assuming 'monthlySales' contains month and sales value
    datasets: [
      {
        label: 'Monthly Sales',
        data: monthlySales.map((sale) => sale.value),
        borderColor: '#42a5f5',
        fill: false,
        tension: 0.4,
      },
    ],
  }), [monthlySales]);

  // Memoize donut chart data for products sold vs remaining inventory
  const donutData = useMemo(() => ({
    labels: ['Sold', 'Remaining'],
    datasets: [
      {
        data: [productsSold, totalListed - productsSold],
        backgroundColor: ['#66bb6a', '#ef5350'],
        hoverBackgroundColor: ['#81c784', '#e57373'],
      },
    ],
  }), [productsSold, totalListed]);

  return (
    <Box className="dashboard-container">
      <Grid container spacing={3}>

        {/* Likes Count */}
        <Grid item xs={12} sm={4} md={4}>
          <Paper className="dashboard-paper equal-height" sx={{ padding: 3, textAlign: 'center'}}>
            <Typography variant="h6" sx={{ mb: 2 }}>Likes Received</Typography>
            <Typography variant="h4" className="dashboard-value">
              <CountUp end={likesReceived} duration={2.5} /> {/* CountUp for likes */}
            </Typography>
          </Paper>
        </Grid>

        {/* Star Reviews Summary */}
        <Grid item xs={12} sm={4} md={4}>
          <Paper className="dashboard-paper equal-height" sx={{ padding: 3 }}>
            <Typography variant="h6">Audience Rating Summary</Typography>
            {/* Display the average rating and total reviews count */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{averageRating}</Typography>
                <Typography variant="body2" color="textSecondary" >★ {totalReviews} ratings</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1}} />

            {/* Rating Bars */}
            <Box>
              <RatingBar label="5" value={reviewsData.fiveStar} total={totalReviews} />
              <RatingBar label="4" value={reviewsData.fourStar} total={totalReviews} />
              <RatingBar label="3" value={reviewsData.threeStar} total={totalReviews} />
              <RatingBar label="2" value={reviewsData.twoStar} total={totalReviews} />
              <RatingBar label="1" value={reviewsData.oneStar} total={totalReviews} />
            </Box>
          </Paper>
        </Grid>

        {/* User's Top Seller Rank */}
        <Grid item xs={12} sm={4} md={4}>
          <Paper className="dashboard-paper equal-height" sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Top Seller Position</Typography>
            <Typography variant="h4" className="dashboard-value" sx={{ mt: 2 }}>
              {`Top ${topSellerRank}%`}
            </Typography>
          </Paper>
        </Grid>

        {/* Monthly Sales Line Graph */}
        <Grid item xs={12} sm={12} md={12}>
          <Paper className="dashboard-paper" sx={{ padding: 3 }}>
            <Typography variant="h6">Monthly Sales Trend</Typography>
            <Line data={salesData} /> {/* Line graph for monthly sales */}
          </Paper>
        </Grid>

        {/* Products Sold Donut Chart */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper same-size" sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ marginBottom: '10px' }}>Sold vs Inventory</Typography>
            <Doughnut data={donutData} /> {/* Donut chart for sold vs remaining inventory */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ display: 'inline-block', width: '100%', whiteSpace: 'nowrap' }}>
              </Typography>
              <Typography variant="body2" sx={{ marginTop: '2px', display: 'inline-block', width: '100%' }}>
                {productsSold} sold out of {totalListed} listed
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Items Bought */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper same-size" sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Items Bought</Typography>
            <Typography variant="h4" className="dashboard-value" sx={{ mt: 2 }}>
              {itemsBought}
            </Typography>
          </Paper>
        </Grid>

        {/* Total Earned */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper same-size" sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Total Earned</Typography>
            <Typography variant="h4" className="dashboard-value" sx={{ mt: 2 }}>
              ${totalEarned}
            </Typography>
          </Paper>
        </Grid>

        {/* Total Spent */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper same-size" sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Total Spent</Typography>
            <Typography variant="h4" className="dashboard-value" sx={{ mt: 2 }}>
              ${totalSpent}
            </Typography>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
});

export default Dashboard;
