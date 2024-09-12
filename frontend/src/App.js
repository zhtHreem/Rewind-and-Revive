import logo from './logo.svg';
import './App.css';
import Header from './Components/Header/header';
import Bidding from './Components/Bidding/Bidding';
import Layout from './Components/Layout/layout';
function App() {
  return (
    <div className="App">
        <Layout>
        <Header/>
        <Bidding/>
        </Layout>
    </div>
  );
}

export default App;