import React, { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';

// Home is eager — most users land here, so we want it in the initial chunk.
import App from './App';

// Every other route is lazy-loaded so the home page only ships home page code.
const EmailVerification    = lazy(() => import('./Components/Login/emailVerification'));
const Header               = lazy(() => import('./Components/Header/header'));
const AboutUsPage          = lazy(() => import('./Components/About/About'));
const Navbar               = lazy(() => import('./Components/Navbar/navbar'));
const BidProductHome       = lazy(() => import('./Components/BidProduct/BidProductHome'));
const BiddingProduct       = lazy(() => import('./Components/BidProduct/BiddingProduct'));
const NewProduct           = lazy(() => import('./Components/Product/createNewProduct'));
const ProductPage          = lazy(() => import('./Components/Product/productPage'));
const CataloguePage        = lazy(() => import('./Components/Product/catalogue'));
const UserProfilePage      = lazy(() => import('./Components/User/profile'));
const Badges               = lazy(() => import('./Components/User/badges'));
const Login                = lazy(() => import('./Components/Login/login'));
const CollaboratorsSection = lazy(() => import('./Components/Collaborators/collaborators'));
const ContactUs            = lazy(() => import('./Components/ContactUs/ContactUs'));
const Cart                 = lazy(() => import('./Components/ShoppingCart/AddCart'));
const Payment              = lazy(() => import('./Components/Payment/payment'));
const Create               = lazy(() => import('./Components/BidProduct/createProduct'));
const ChatFeature          = lazy(() => import('./Components/ProductChat/ProductChat'));
const Celeb                = lazy(() => import('./Components/celebBidders/AuctionList'));
const Chatbot              = lazy(() => import('./Components/Chatbot/Chatbot'));
const ConfirmationWrapper  = lazy(() => import('./Components/Payment/ConfirmationWrapper'));

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '42763443644-3vu05jba750miai4co92m874jh8pjuak.apps.googleusercontent.com';

// Wrap a lazy element in a Suspense boundary so React knows what to show while it loads.
const withSuspense = (node) => (
  <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>Loading…</div>}>
    {node}
  </Suspense>
);

const router = createBrowserRouter([
  { path: "/",                    element: <App /> },
  { path: "/AboutUs",             element: withSuspense(<AboutUsPage />) },
  { path: "/nav",                 element: withSuspense(<Navbar />) },
  { path: "/chatbot",             element: withSuspense(<Chatbot />) },
  { path: "/header",              element: withSuspense(<Header />) },
  { path: "/createproduct",       element: withSuspense(<NewProduct />) },
  { path: "/product/:productId",  element: withSuspense(<ProductPage />) },
  { path: "/bidProduct",          element: withSuspense(<BidProductHome />) },
  { path: "/biddingProduct/:id",  element: withSuspense(<BiddingProduct />) },
  { path: "/create",              element: withSuspense(<Create />) },
  { path: "/catalogue",           element: withSuspense(<CataloguePage />) },
  // Legacy redirect: old links pointing to /c should still work
  { path: "/c",                   element: withSuspense(<CataloguePage />) },
  { path: "/profile/:id",         element: withSuspense(<UserProfilePage />) },
  { path: "/badge",               element: withSuspense(<Badges />) },
  { path: "/login",               element: withSuspense(<Login />) },
  { path: "/collaborator",        element: withSuspense(<CollaboratorsSection />) },
  { path: "/contact",             element: withSuspense(<ContactUs />) },
  { path: "/cart",                element: withSuspense(<Cart />) },
  { path: "/payment",             element: withSuspense(<Payment />) },
  { path: "/confirmation",        element: withSuspense(<ConfirmationWrapper />) },
  { path: "/verify-email",        element: withSuspense(<EmailVerification />) },
  { path: "/chatfeature",         element: withSuspense(<ChatFeature />) },
  { path: "/celeb",               element: withSuspense(<Celeb />) },
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
