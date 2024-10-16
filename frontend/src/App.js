import logo from './logo.svg';
import './App.css';
import Header from './Components/Header/header';
import Bidding from './Components/Bidding/Bidding';
import Layout from './Components/Layout/layout';
import LimitedTimeDeals from './Components/LimitedTimeDeals/limitedtimedeals';
import PopularFabricsSection from './Components/MostPopularItem/mostPopular';
function App() {
  return (
    <div className="App">
        <Layout>
        <Header/>
        <LimitedTimeDeals/>
        <PopularFabricsSection/>
        <Bidding/>
        </Layout>
    </div>
  );
}

export default App;