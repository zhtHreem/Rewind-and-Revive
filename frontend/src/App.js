import logo from './logo.svg';
import './App.css';
import Navbar from './Components/Navbar/navbar'
import BiddingSystem from './Components/Bidding/Bidding'
function App() {
  return (
    <div className="App">
      <Navbar/>
      <BiddingSystem/>
    </div>
  );
}

export default App;
