import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import EmailVerification from './Components/Login/emailVerification';
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
import Login from './Components/Login/login';
import CollaboratorsSection from './Components/Collaborators/collaborators';
import ContactUs from './Components/ContactUs/ContactUs'; 
import Cart from './Components/ShoppingCart/AddCart';
import Payment from './Components/Payment/payment'; 
import Create from './Components/BidProduct/createProduct';
import ChatFeature from './Components/ProductChat/ProductChat';
import Celeb from './Components/celebBidders/AuctionList';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Chatbot from './Components/Chatbot/Chatbot';
import ConfirmationWrapper from './Components/Payment/ConfirmationWrapper';
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
    path: "/chatbot",
    element: <Chatbot />,
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
    path: "/product/:productId",
    element: <ProductPage />,
  },
  {
    path: "/bidProduct",
    element: <BidProductHome />,
  },
  {
    path: "/biddingProduct/:id",
    element: <BiddingProduct />,
  },{
    path: "/create",
    element: <Create/>,
  },
  {
    path: "/c",
    element: <CataloguePage />,
  },
  {
    path: "/profile/:id",
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
    element: <ConfirmationWrapper />,
  },
  {
    path: "/verify-email",
    element: <EmailVerification />,
  },
  {
    path: "/chatfeature",
    element: <ChatFeature />, // ChatFeature route
  },{
    path: "/celeb",
    element: <Celeb />, // ChatFeature route
  }

]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
       <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
