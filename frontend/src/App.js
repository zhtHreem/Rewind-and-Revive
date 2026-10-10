import React, { useState, lazy, Suspense } from 'react';
import './App.css';
import PatternHero from './Components/Home/PatternHero';
import KineticRows from './Components/Home/KineticRows';
import Categories from './Components/Home/Categories';
import Features from './Components/Home/Features';
import Bidding from './Components/Bidding/Bidding';
import Layout from './Components/Layout/layout';
import robotIcon from './assets/robot-svgrepo-com.svg';
import RecommendedProductsSection from './Components/MostPopularItem/exploreRecommendation';

// Lazy-load the chatbot — it's only mounted when the user clicks the icon
const Chatbot = lazy(() => import('./Components/Chatbot/Chatbot'));

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatWindow = () => {
    setIsChatbotOpen((prev) => !prev);
  };

  return (
    <div className="App">
      <Layout>
        <PatternHero />
        <Categories />
        <RecommendedProductsSection />
        <Bidding />
        <Features onOpenChat={toggleChatWindow} />
        <KineticRows />

        <div className="robot-icon-wrapper">
          <div className="robot-icon-container" onClick={toggleChatWindow}>
            <img src={robotIcon} alt="Robot Icon" className="robot-icon" />
            <div className="dialog-box">👋 Hey! Need assistance? Click here!</div>
          </div>

          {isChatbotOpen && (
            <div className="chatbot-window">
              <Suspense fallback={<div style={{ padding: 16 }}>Loading chat…</div>}>
                <Chatbot toggleChatWindow={toggleChatWindow} />
              </Suspense>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

export default App;
