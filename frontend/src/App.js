import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Fade,
  Zoom,
  Slide,
  keyframes,
  styled,
  alpha
} from '@mui/material';
import {
  RecyclingOutlined,
  AutoAwesomeOutlined,
  FavoriteOutlined,
  ShoppingBagOutlined,
  // SparklesOutlined
} from '@mui/icons-material';
import YardIcon from '@mui/icons-material/Yard';
import './App.css';
import Header from './Components/Header/header';
import Bidding from './Components/Bidding/Bidding';
import Layout from './Components/Layout/layout';
import LimitedTimeDeals from './Components/LimitedTimeDeals/limitedtimedeals';
import robotIcon from './assets/robot-svgrepo-com.svg'; 
import RecommendedProductsSection from './Components/MostPopularItem/exploreRecommendation';
import Chatbot from './Components/Chatbot/Chatbot'; 
// import WindowSizeDisplay from './utils/screensize';

// Styled components for animations
const FloatingIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' }
  }
}));

const PulsingIcon = styled(Box)(({ theme }) => ({
  animation: 'pulse 2s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
    '50%': { opacity: 1, transform: 'scale(1.1)' }
  }
}));

// const RotatingRing = styled(Box)(({ theme }) => ({
//   animation: 'rotate 4s linear infinite',
//   '@keyframes rotate': {
//     from: { transform: 'rotate(0deg)' },
//     to: { transform: 'rotate(360deg)' }
//   }
// }));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 'bold'
}));

// Loading Screen Component
const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const steps = [
    { 
      text: "Discovering unique treasures...", 
      icon: <AutoAwesomeOutlined sx={{ fontSize: 28 }} />,
      color: '#FFD700'
    },
    { 
      text: "Powering AI recommendations...", 
      icon: <RecyclingOutlined sx={{ fontSize: 28 }} />,
      color: '#4CAF50'
    },
    { 
      text: "Connecting sustainable fashion...", 
      icon: <FavoriteOutlined sx={{ fontSize: 28 }} />,
      color: '#E91E63'
    },
    { 
      text: "Welcome to Rewind & Revive!", 
      icon: <ShoppingBagOutlined sx={{ fontSize: 28 }} />,
      color: '#2196F3'
    }
  ];

  const backgroundIcons = [
    <ShoppingBagOutlined />,
    <FavoriteOutlined />,
    <AutoAwesomeOutlined />,
    <RecyclingOutlined />,
     <YardIcon />,
    // <SparklesOutlined />
  ];

  useEffect(() => {
    // Show logo after initial delay
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    
    // Show particles
    const particleTimer = setTimeout(() => setShowParticles(true), 800);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Start fade out after completion
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onComplete?.(), 1000);
          }, 1500);
          return 100;
        }
        return prev + 1.5;
      });
    }, 60);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1400);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(particleTimer);
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <Fade in={!fadeOut} timeout={1000}>
      <Box    sx={{    position: 'fixed',     top: 0,   left: 0,     right: 0,    bottom: 0,  zIndex: 9999,    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',   display: 'flex', alignItems: 'center',  justifyContent: 'center',   overflow: 'hidden'  }}>
        {/* Animated background particles */}
        {showParticles && (
          <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {[...Array(15)].map((_, i) => (
              <PulsingIcon
                key={i}
                sx={{  position: 'absolute',    left: `${Math.random() * 90}%`,   top: `${Math.random() * 90}%`,    animationDelay: `${Math.random() * 2}s`,  color: alpha('#fff', 0.1), fontSize: '2rem'  }} >
                {backgroundIcons[i % backgroundIcons.length]}
              </PulsingIcon>
            ))}
          </Box>
        )}

        {/* Floating fashion items */}
        <Box sx={{ position: 'absolute', inset: 0 }}>
          {[...Array(6)].map((_, i) => (
            <FloatingIcon
              key={i}
              sx={{   left: `${15 + (i * 15)}%`,    top: `${25 + Math.sin(i) * 20}%`,     animationDelay: `${i * 0.5}s`,  color: alpha('#fff', 0.15),   fontSize: '3rem'  }} >
              {backgroundIcons[i]}
            </FloatingIcon>
          ))}
        </Box>

        <Box
          sx={{
            textAlign: 'center',  maxWidth: 500,  px: 4,  position: 'relative'}}   >
          {/* Logo Section */}
          <Zoom in={showLogo} timeout={1000}>
            <Box sx={{ mb: 6, position: 'relative' }}>
           
              {/* Central logo */}
              <Box
                sx={{ position: 'relative',width: 100,  height: 100,   mx: 'auto',   mb: 3, background: 'linear-gradient(45deg, #fff, #e3f2fd)',  borderRadius: '50%',  display: 'flex', alignItems: 'center', justifyContent: 'center',  boxShadow: '0 8px 32px rgba(255,255,255,0.3)'  }}  >
                <RecyclingOutlined 
                  sx={{  fontSize: 50,  color: '#667eea',  animation: 'pulse 2s ease-in-out infinite' }}  />
              </Box>

              {/* Brand name */}
              <GradientText variant="h3" component="h1" sx={{ mb: 1 }}>
                R&R
              </GradientText>
              
              <Typography
                variant="h6"
                sx={{  color: alpha('#fff', 0.9),  fontWeight: 300,   letterSpacing: '0.1em' }} >
                Rewind & Revive
              </Typography>
            </Box>
          </Zoom>

          {/* Loading Steps */}
          <Box sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Slide   key={index} direction="up"   in={currentStep >= index}  timeout={600}   >
                <Box
                  sx={{  display: currentStep === index ? 'flex' : 'none', alignItems: 'center',  justifyContent: 'center', gap: 2,   mb: 2,minHeight: 40  }} >
                  <Box
                    sx={{color: step.color, display: 'flex', alignItems: 'center',animation: 'pulse 1.5s ease-in-out infinite'  }} >
                    {step.icon}
                  </Box>
                  <Typography
                    variant="body1"   sx={{    color: '#fff',  fontWeight: 500,  fontSize: '1.1rem' }}  >
                    {step.text}
                  </Typography>
                </Box>
              </Slide>
            ))}
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <LinearProgress variant="determinate"  value={progress}  sx={{  height: 8,  borderRadius: 4,   backgroundColor: alpha('#fff', 0.3), '& .MuiLinearProgress-bar': { borderRadius: 4,   background: 'linear-gradient(90deg, #FFD700, #4CAF50, #E91E63, #2196F3)' } }} />
            <Typography
              variant="body2"
              sx={{   color: alpha('#fff', 0.8),mt: 1,   fontWeight: 500 }}>
              {Math.round(progress)}%
            </Typography>
          </Box>

          {/* Tagline */}
          <Fade in={progress > 50} timeout={1000}>
            <Typography
              variant="body2"
              sx={{   color: alpha('#fff', 0.7), fontStyle: 'italic',  fontSize: '0.9rem'    }} >
              Sustainable Fashion • AI-Powered • Community-Driven
            </Typography>
          </Fade>
        </Box>

        {/* Corner decorations */}
        <Box
          sx={{   position: 'absolute',  top: 20,  right: 20,  opacity: 0.1  }}  >
          <PulsingIcon>
            <YardIcon sx={{ fontSize: 60 }} />
          </PulsingIcon>
        </Box>

        <Box
          sx={{   position: 'absolute', bottom: 20,  left: 20,   opacity: 0.1}}   >
          <FloatingIcon sx={{ animationDelay: '1s' }}>
            <AutoAwesomeOutlined sx={{ fontSize: 50 }} />
          </FloatingIcon>
        </Box>
      </Box>
    </Fade>
  );
};

// Main App Component
function App() {
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(() => {
    // Check if user has already seen the intro
    return !sessionStorage.getItem("introShown");
  });
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatWindow = () => {
    setIsChatbotOpen(!isChatbotOpen); 
  };

  const handleLoadingComplete = () => {
    setLoading(false);
    sessionStorage.setItem("introShown", "true");
  };

  return (
    <div className="App">
      {/* Show loading screen first */}
      {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
      
      {/* Show main content after loading */}
      <div style={{ display: loading ? "none" : "block" }}>
        <Layout>
          {/* <WindowSizeDisplay /> */}
          <Header />
          <LimitedTimeDeals />
          <RecommendedProductsSection/>
          <Bidding />

          <div className="robot-icon-wrapper">
            <div className="robot-icon-container" onClick={toggleChatWindow}>
              <img src={robotIcon} alt="Robot Icon" className="robot-icon" />
              <div className="dialog-box">👋 Hey! Need assistance? Click here!</div>
            </div>

            {isChatbotOpen && (
              <div className="chatbot-window">
                <Chatbot toggleChatWindow={toggleChatWindow} />
              </div>
            )}
          </div>
        </Layout>
      </div>
    </div>
  );
}

export default App;