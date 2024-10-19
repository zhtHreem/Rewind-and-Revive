import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider ,createBrowserRouter} from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import Header from './Components/Header/header';
import './index.css';
import App from './App';
import Navbar from './Components/Navbar/navbar';
import BidProductHome from './Components/BidProduct/BidProductHome'
import BiddingProduct from './Components/BidProduct/BiddingProduct';
import NewProduct from './Components/Product/createNewProduct';
import ProductPage from './Components/Product/productPage';//Remove unnecessary paths after updating the pages so that only the relevant pages remain
import CataloguePage from './Components/Product/catalogue';
import UserProfilePage from './Components/User/profile';
import Badges from './Components/User/badges';
import { LoginProvider } from './Components/Login/logincontext';
import Login from './Components/Login/login';
import CollaboratorsSection from './Components/Collaborators/collaborators';
<<<<<<< HEAD
import ContactUs from './Components/ContactUs/ContactUs';

=======
import ShoppingCart from './Components/ShoppingCart/AddCart'
import Payment from './Components/Payment/payment';
>>>>>>> 63c444549bdd90ac20de46925394a5f9285cfead
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
<<<<<<< HEAD
    path: "/nav",
    element: <Navbar />,
  },
  {
    path: "/header",
    element: <Header />,
  },
  {
    path: "/new",
    element: <NewProduct />,
  },
  {
    path: "/product",
    element: <ProductPage />,
  },
  {
    path: "/bidProduct",
    element: <BidProductHome />,
  },
  {
    path: "/BiddingProduct",
    element: <BiddingProduct />,
  },
  {
    path: "/c",
    element: <CataloguePage />,
  },
  {
    path: "/profile",
    element: <UserProfilePage />,
  },
  {
    path: "/badge",
    element: <Badges />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/collaborator",
    element: <CollaboratorsSection />,
  },
  {
    path: "/contact", // <-- Add this route for ContactUs
    element: <ContactUs />,
=======
    path:"/nav",
    element:<Navbar/>
  },{
    path:"/header",
    element:<Header/>
  },{
    path:"/new",
    element:<NewProduct/>
  },{
    path:"/product",
    element:<ProductPage/>
  },{
    path:"/bidProduct",
    element:<BidProductHome/>
  },{
    path:"/BiddingProduct",
    element:<BiddingProduct/>
  },{
    path:"/c",
    element:<CataloguePage/>
  },{
    path:"/profile",
    element:<UserProfilePage/>
  },{
    path:"/badge",
    element:<Badges/>
  },{
    path:"/login",
    element:<Login/>
  },{
    path:"/collaborator",
    element:<CollaboratorsSection/>
  },{
    path:"/cart",
    element:<ShoppingCart/>
  },{
    path:"/payment",
    element:<Payment/>
>>>>>>> 63c444549bdd90ac20de46925394a5f9285cfead
  }
]);





const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <LoginProvider>
    <RouterProvider router={router}/>
   </LoginProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
