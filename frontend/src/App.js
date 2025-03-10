import React, { useState } from 'react';
import './App.css';
import Header from './Components/Header/header';
import Bidding from './Components/Bidding/Bidding';
import Layout from './Components/Layout/layout';
import LimitedTimeDeals from './Components/LimitedTimeDeals/limitedtimedeals';
import PopularFabricsSection from './Components/MostPopularItem/mostPopular';
import robotIcon from './assets/robot-svgrepo-com.svg'; // Import robot SVG
import RecommendedProductsSection from './Components/MostPopularItem/exploreRecommendation';
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
        <PopularFabricsSection />
        <Bidding />

        {/* Robot Icon with Dialog Box */}
        <div className="robot-icon-container" onClick={toggleChatWindow}>
          <img src={robotIcon} alt="Robot Icon" className="robot-icon" />
          
          {/* New dialog box */}
          <div className="dialog_box bottom">
            <p>I'm your fashion assistant</p>
          </div>
        </div>

 
      </Layout>
    </div>
  );
}

export default App;