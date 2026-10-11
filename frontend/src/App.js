import React from 'react';
import PatternHero from './Components/Home/PatternHero';
import KineticRows from './Components/Home/KineticRows';
import Categories from './Components/Home/Categories';
import Features from './Components/Home/Features';
import Bidding from './Components/Bidding/Bidding';
import Layout from './Components/Layout/layout';
import RecommendedProductsSection from './Components/MostPopularItem/exploreRecommendation';
import { OPEN_REVI } from './Components/Chatbot/ReviLauncher';

function App() {
  return (
    <div className="App">
      <Layout>
        <PatternHero />
        <Categories />
        <RecommendedProductsSection />
        <Bidding />
        <Features onOpenChat={() => window.dispatchEvent(new Event(OPEN_REVI))} />
        <KineticRows />
      </Layout>
    </div>
  );
}

export default App;
