import React, { useMemo } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, Divider } from '@mui/material';
import CountUp from 'react-countup';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './Dashboard.css';

Chart.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

const Dashboard = React.memo(() => {
  // Hardcoded data for demonstration purposes
  const stats = {
    productsSold: 150,
    totalListed: 200,
    itemsBought: 75,
    totalSpent: 5000,
    totalEarned: 10000,
    likesReceived: 350,
  };

  const monthlySales = [
    { month: 'Jan', value: 200 },
    { month: 'Feb', value: 150 },
    { month: 'Mar', value: 300 },
    { month: 'Apr', value: 250 },
    { month: 'May', value: 320 },
    { month: 'Jun', value: 400 },
  ];

  const reviewsData = {
    fiveStar: 80,
    fourStar: 50,
    threeStar: 30,
    twoStar: 20,
    oneStar: 10,
  };

  const topSellerRank = 5;

  const totalReviews = Object.values(reviewsData).reduce((acc, val) => acc + val, 0);
  const averageRating = (
    (5 * reviewsData.fiveStar +
      4 * reviewsData.fourStar +
      3 * reviewsData.threeStar +
      2 * reviewsData.twoStar +
      1 * reviewsData.oneStar) / totalReviews
  ).toFixed(1);

  const salesData = useMemo(
    () => ({
      labels: monthlySales.map((sale) => sale.month),
      datasets: [
        {
          label: 'Monthly Sales',
          data: monthlySales.map((sale) => sale.value),
          borderColor: '#42a5f5',
          fill: false,
          tension: 0.4,
        },
      ],
    }),
    [monthlySales]
  );

  const donutData = useMemo(
    () => ({
      labels: ['Sold', 'Remaining'],
      datasets: [
        {
          data: [stats.productsSold, stats.totalListed - stats.productsSold],
          backgroundColor: ['#66bb6a', '#ef5350'],
          hoverBackgroundColor: ['#81c784', '#e57373'],
        },
      ],
    }),
    [stats.productsSold, stats.totalListed]
  );

  return (
    <Box className="dashboard-container">
      <Grid container spacing={3}>
        {/* Likes Count */}
        <Grid item xs={12} sm={4} md={4}>
          <Paper className="dashboard-paper equal-height" sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Likes Received</Typography>
            <Typography variant="h4" className="dashboard-value">
              <CountUp end={stats.likesReceived} duration={2.5} />
            </Typography>
          </Paper>
        </Grid>

        {/* Star Reviews Summary */}
        <Grid item xs={12} sm={4} md={4}>
          <Paper className="dashboard-paper equal-height" sx={{ padding: 3 }}>
            <Typography variant="h6">Audience Rating Summary</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{averageRating}</Typography>
                <Typography variant="body2" color="textSecondary">★ {totalReviews} ratings</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
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
              Top {topSellerRank}%
            </Typography>
          </Paper>
        </Grid>

        {/* Monthly Sales Line Graph */}
        <Grid item xs={12}>
          <Paper className="dashboard-paper" sx={{ padding: 3 }}>
            <Typography variant="h6">Monthly Sales Trend</Typography>
            <Line data={salesData} />
          </Paper>
        </Grid>

        {/* Products Sold Donut Chart */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper same-size" sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Sold vs Inventory</Typography>
            <Doughnut data={donutData} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                {stats.productsSold} sold out of {stats.totalListed} listed
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Items Bought */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper same-size" sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Items Bought</Typography>
            <Typography variant="h4" className="dashboard-value" sx={{ mt: 2 }}>
              {stats.itemsBought}
            </Typography>
          </Paper>
        </Grid>

        {/* Total Earned */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper same-size" sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Total Earned</Typography>
            <Typography variant="h4" className="dashboard-value" sx={{ mt: 2 }}>
              ${stats.totalEarned}
            </Typography>
          </Paper>
        </Grid>

        {/* Total Spent */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="dashboard-paper same-size" sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Total Spent</Typography>
            <Typography variant="h4" className="dashboard-value" sx={{ mt: 2 }}>
              ${stats.totalSpent}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
});

export default Dashboard;
