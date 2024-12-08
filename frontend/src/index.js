import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import Header from './Components/Header/header';
import './index.css';
import App from './App';
import Navbar from './Components/Navbar/navbar';
import BidProductHome from './Components/BidProduct/BidProductHome';
import BiddingProduct from './Components/BidProduct/BiddingProduct';
import NewProduct from './Components/Product/createNewProduct';
import ProductPage from './Components/Product/productPage';
import CataloguePage from './Components/Product/catalogue';
import UserProfilePage from './Components/User/profile';
import Badges from './Components/User/badges';
import { LoginProvider } from './Components/Login/logincontext';
import Login from './Components/Login/login';
import CollaboratorsSection from './Components/Collaborators/collaborators';
import Confirmation from './Components/Payment/Confirmation'
import ContactUs from './Components/ContactUs/ContactUs'; // Correct import for ContactUs
import Cart from './Components/ShoppingCart/AddCart';
import Payment from './Components/Payment/payment'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
const GOOGLE_CLIENT_ID = '42763443644-3vu05jba750miai4co92m874jh8pjuak.apps.googleusercontent.com';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/nav",
    element: <Navbar />,
  },
  {
    path: "/header",
    element: <Header />,
  },
  {
    path: "/createproduct",
    element: <NewProduct/>,
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
    path: "/contact",
    element: <ContactUs />, // ContactUs route
  },
  {
    path: "/cart",
    element: <Cart />, // ShoppingCart route
  },
  {
    path: "/payment",
    element: <Payment />, // Payment route
  },
  {
    path: "/confirmation",
    element: <Confirmation />,
  }

]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
       <Provider store={store}>
        <LoginProvider>
          <RouterProvider router={router} />
        </LoginProvider>
        </Provider>
      </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
