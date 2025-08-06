import React from 'react';
import { Box,Container, Typography, Grid, Card, CardContent, Avatar, Chip, Paper, Stack, Button, Divider, useTheme, alpha
} from '@mui/material';
import { default as CompostIcon } from '@mui/icons-material/Yard';
import { useNavigate } from 'react-router-dom';
import {
  SmartToyOutlined,
  ShoppingCartOutlined,
  ChatOutlined,
  SecurityOutlined,
  RecommendOutlined,
  NotificationsOutlined,
  PaymentOutlined
} from '@mui/icons-material';
import Layout from '../Layout/layout';

const AboutUsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <SmartToyOutlined />,
      title: "AI-Powered Outfit Recommendations",
      description: "Our advanced MobileNet algorithm analyzes fashion items and uses cosine similarity to suggest perfect outfit combinations tailored to your style.",
      color: "#6366F1"
    },
    {
      icon: <RecommendOutlined />,
      title: "Personalized Discovery Engine",
      description: "Smart recommendation system that learns from your browsing history to surface items you'll love, making sustainable shopping effortless.",
      color: "#EC4899"
    },
    {
      icon: <ChatOutlined />,
      title: "Real-Time Bidding & Chat",
      description: "Interactive Socket.IO-powered platform enabling live bidding wars and instant communication between buyers and sellers.",
      color: "#10B981"
    },
    {
      icon: <NotificationsOutlined />,
      title: "Gamification & Notifications",
      description: "Engaging notification system with gamification elements powered by Socket.IO and Redux to enhance your thrifting experience.",
      color: "#F59E0B"
    },
    {
      icon: <SmartToyOutlined />,
      title: "AI Styling Assistant",
      description: "RAG-based Gemini chatbot provides personalized styling advice and helps you make confident purchase decisions.",
      color: "#8B5CF6"
    },
    {
      icon: <SecurityOutlined />,
      title: "Secure Authentication",
      description: "Protected user accounts with JWT tokens and seamless Gmail login integration for maximum security and convenience.",
      color: "#EF4444"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Unique Items" },
    { number: "5,000+", label: "Happy Customers" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "50%", label: "Average Savings" }
  ];

  const technologies = [
    "React.js", "Node.js", "MongoDB", "Express.js", "Socket.IO", 
    "MobileNet", "Gemini AI", "Stripe", "JWT", "Redux", "Material-UI"
  ];

  return (
    <Layout>
  <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
    <Box sx={{ background: `linear-gradient(135deg, ${alpha('#1976d2', 0.8)}, ${alpha('#9c27b0', 0.8)})`, color: 'white', py: 8, position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="lg">
        <Grid container alignItems="center" spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>Rewind & Revive</Typography>
            <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>The Future of Sustainable Fashion</Typography>
            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>Discover unique, second-hand treasures through our AI-powered thrift store. We're revolutionizing sustainable fashion with cutting-edge technology, personalized recommendations, and an engaging community experience.</Typography>
            <Stack direction="row" spacing={2}>
              <Button onClick={()=>navigate("/c")}variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: alpha('#fff', 0.9) } }}>Explore Collection</Button>
              <Button variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: alpha('#fff', 0.7), bgcolor: alpha('#fff', 0.1) } }}>Learn More</Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 400, bgcolor: alpha('#fff', 0.1), borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
              <CompostIcon  sx={{ fontSize: 120, opacity: 0.7 }} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>

    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3, transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
              <Typography variant="h3" fontWeight="bold" color="primary">{stat.number}</Typography>
              <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>

    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 350, bgcolor: alpha('#4caf50', 0.1), borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CompostIcon sx={{ fontSize: 100, color: '#4caf50' }} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>Our Mission</Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.7 }}>At Rewind & Revive, we believe fashion should be sustainable, accessible, and personalized. Our mission is to revolutionize the thrift shopping experience by combining cutting-edge AI technology with a passion for environmental consciousness.</Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.7 }}>Every pre-loved item on our platform gets a second chance to shine, while our AI-powered systems ensure you discover pieces that perfectly match your style and preferences.</Typography>
          <Chip label="Sustainable Fashion Pioneer" color="success" size="large" />
        </Grid>
      </Grid>
    </Container>

    <Box sx={{ bgcolor: 'white', py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>Advanced Features</Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, fontSize: '1.1rem' }}>Discover what makes our platform the most advanced thrift store experience</Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[8] } }}>
                <CardContent sx={{ p: 3, height: '100%' }}>
                  <Avatar sx={{ bgcolor: feature.color, width: 56, height: 56, mb: 2 }}>{feature.icon}</Avatar>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>

    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>Built with Modern Technology</Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>Our full-stack MERN application leverages cutting-edge technologies</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        {technologies.map((tech, index) => (
          <Chip key={index} label={tech} variant="outlined" size="large" sx={{ fontSize: '0.9rem', py: 1, transition: 'all 0.3s ease', '&:hover': { bgcolor: 'primary.main', color: 'white', transform: 'scale(1.05)' } }} />
        ))}
      </Box>
    </Container>

    <Box sx={{ bgcolor: alpha('#f5f5f5', 0.5), py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Secure & Convenient</Typography>
            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.7 }}>Shop with confidence knowing your transactions are protected by industry-leading security measures and seamless payment processing.</Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><PaymentOutlined color="primary" /><Typography variant="body1">Stripe Payment Integration</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><SecurityOutlined color="primary" /><Typography variant="body1">JWT Secure Authentication</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><ShoppingCartOutlined color="primary" /><Typography variant="body1">Gmail Login Integration</Typography></Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 250, bgcolor: alpha('#2196f3', 0.1), borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SecurityOutlined sx={{ fontSize: 80, color: '#2196f3' }} /></Box>
          </Grid>
        </Grid>
      </Container>
    </Box>

    <Box sx={{ background: `linear-gradient(135deg, ${alpha('#4caf50', 0.9)}, ${alpha('#2196f3', 0.9)})`, color: 'white', py: 6, textAlign: 'center' }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" gutterBottom>Ready to Start Your Sustainable Fashion Journey?</Typography>
        <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>Join thousands of fashion-conscious shoppers discovering unique treasures while making a positive impact on the environment.</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button onClick={()=>navigate("/c")} variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', px: 4, '&:hover': { bgcolor: alpha('#fff', 0.9) } }}>Start Shopping</Button>
          <Button onClick={()=>navigate("/contact")} variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white', px: 4, '&:hover': { borderColor: alpha('#fff', 0.7), bgcolor: alpha('#fff', 0.1) } }}>Contact Us</Button>
        </Stack>
      </Container>
    </Box>
  </Box>
  </Layout>
);

};

export default AboutUsPage;