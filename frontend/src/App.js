import React, { useState } from 'react';
import './App.css';
import Header from './Components/Header/header';
import Bidding from './Components/Bidding/Bidding';
import Layout from './Components/Layout/layout';
import LimitedTimeDeals from './Components/LimitedTimeDeals/limitedtimedeals';
import robotIcon from './assets/robot-svgrepo-com.svg'; // Import robot SVG
import RecommendedProductsSection from './Components/MostPopularItem/exploreRecommendation';
import Chatbot from './Components/Chatbot/Chatbot'; // adjust path if different

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatWindow = () => {
    setIsChatbotOpen(!isChatbotOpen); // Toggle chatbot visibility
  };

  return (
    <div className="App">
      <Layout>
        <Header />
        <LimitedTimeDeals />
        <RecommendedProductsSection/>
        <Bidding />

        <div className="robot-icon-wrapper">
  <div className="robot-icon-container" onClick={toggleChatWindow}>
    <img src={robotIcon} alt="Robot Icon" className="robot-icon" />
    <div className="dialog-box bottom">
      <p>I'm your fashion assistant</p>
    </div>
  </div>

  {/* Chatbot appears if state is true */}
  {isChatbotOpen && (
    <div className="chatbot-window">
      <Chatbot toggleChatWindow={toggleChatWindow} />
    </div>
  )}
</div>



 
      </Layout>
    </div>
  );
}

export default App;