import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";
import { Box, Grid, Paper, Typography, LinearProgress, Divider } from '@mui/material';
import CountUp from 'react-countup';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import SkeletonLoader from '../Utils/skeletonLoader';

Chart.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
const DashboardSkeleton = () => (
  <Box sx={{ padding: 3 }}>
    <Grid container spacing={3}>
      {[...Array(8)].map((_, idx) => (
        <Grid key={idx} item xs={12} md={idx < 2 ? 6 : idx < 6 ? 6 : 4}>
          <Paper sx={{ padding: 3, textAlign: 'center' }}>
            <SkeletonLoader.Text lines={1} width="60%" />
            <SkeletonLoader.Text lines={1} width="40%" />
            {idx === 2 && <SkeletonLoader height="200px" width="100%" />} {/* Chart placeholder */}
            {idx === 5 && <SkeletonLoader height="180px" width="100%" />} {/* Doughnut chart */}
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const RatingBar = ({ label, value, total }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
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

const Dashboard = () => {
  const params = useParams();
  
  const userId = params.id;
  const [stats, setStats] = useState({
    productsSold: 0,
    totalListed: 0,
    itemsBought: 0,
    totalSpent: 0,
    totalEarned: 0,
    likesReceived: 0
  });
  const [reviewsData, setReviewsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [topSellerRank, setTopSellerRank] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token missing. Please log in again.");
        return;
      }

      if (!userId) {
        console.warn("No userId found in the URL.");
        return;
      }

     

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_LOCAL_URL}/api/user/profile/${userId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        const userData = response.data;
        

        setStats(userData.stats);
        setReviewsData(userData.reviewsData || {}); // Ensure safe state update
        setTopSellerRank(userData.topSellerRank || 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error.response?.data || error.message);
        alert("Error fetching dashboard data");
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const totalReviews = useMemo(() => (
    (reviewsData.fiveStar || 0) +
    (reviewsData.fourStar || 0) +
    (reviewsData.threeStar || 0) +
    (reviewsData.twoStar || 0) +
    (reviewsData.oneStar || 0)
  ), [reviewsData]);
  
  const averageRating = useMemo(() => 
    totalReviews > 0
      ? ((5 * (reviewsData.fiveStar || 0) +
          4 * (reviewsData.fourStar || 0) +
          3 * (reviewsData.threeStar || 0) +
          2 * (reviewsData.twoStar || 0) +
          1 * (reviewsData.oneStar || 0)) / totalReviews).toFixed(1)
      : 0,
    [reviewsData, totalReviews]
  );
  
  // Send averageRating to the backend when it changes
  useEffect(() => {
   
    if (userId && totalReviews > 0) {
      const sendAverageRating = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.warn("No token found, skipping rating update.");
            return;
          }

       
  
          await axios.put(
            `${process.env.REACT_APP_LOCAL_URL}/api/user/update-rating/${userId}`,
            { averageRating },
            {
              headers: {
                Authorization: token,
                "Content-Type": "application/json",
              },
            }
          );
  
        } catch (error) {
          console.error("Error updating average rating:", error.response?.data || error.message);
        }
      };
  
      sendAverageRating();
    }
  }, [averageRating, userId, totalReviews]);
  

  const salesData = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Sales',
      data: [200, 150, 300, 250, 320, 400],
      borderColor: '#42a5f5',
      fill: false,
      tension: 0.4
    }]
  }), []);

  const donutData = useMemo(() => ({
    labels: ['Sold', 'Remaining'],
    datasets: [{
      data: [stats.productsSold, stats.totalListed - stats.productsSold],
      backgroundColor: ['#66bb6a', '#ef5350']
    }]
  }), [stats.productsSold, stats.totalListed]);

  if (loading) return <DashboardSkeleton />;


  return (
    <Box sx={{ padding: 3 }}>
      <Grid container spacing={3}>

        

        {/* Monthly Sales Trend Full Width */}
        <Grid item xs={12}>
          <Paper sx={{ padding: 3 }}>
            <Typography variant="h6">Monthly Sales Trend</Typography>
            <Line data={salesData} />
          </Paper>
        </Grid>

        {/* Audience Rating and Donut Chart Together */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 3 }}>
            <Typography variant="h6">Audience Rating Summary</Typography>
            <Typography variant="h4">{averageRating}</Typography>
            <Typography variant="body2">★ {totalReviews} ratings</Typography>
            <Divider sx={{ my: 1 }} />
            <RatingBar label="5" value={reviewsData.fiveStar || 0} total={totalReviews} />
            <RatingBar label="4" value={reviewsData.fourStar || 0} total={totalReviews} />
            <RatingBar label="3" value={reviewsData.threeStar || 0} total={totalReviews} />
            <RatingBar label="2" value={reviewsData.twoStar || 0} total={totalReviews} />
            <RatingBar label="1" value={reviewsData.oneStar || 0} total={totalReviews} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Sold vs Inventory</Typography>
            <Doughnut data={donutData} />
            <Typography variant="body2">
              {stats.productsSold} sold out of {stats.totalListed}
            </Typography>
          </Paper>
        </Grid>

        {/* Items Bought, Total Earned, Total Spent Together */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Items Bought</Typography>
            <Typography variant="h4">{stats.itemsBought}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Total Earned</Typography>
            <Typography variant="h4">
  Rs.{stats.totalEarned !== undefined && stats.totalEarned !== null ? stats.totalEarned : '0.00'}
</Typography>

          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 3, textAlign: 'center' }}>
            <Typography variant="h6">Total Spent</Typography>
            <Typography variant="h4">Rs.{stats.totalSpent}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
