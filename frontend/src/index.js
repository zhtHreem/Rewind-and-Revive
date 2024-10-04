import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider ,createBrowserRouter} from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import Header from './Components/Header/header';
import './index.css';
import App from './App';
import Navbar from './Components/Navbar/navbar';
import BidProduct from './Components/BidProduct/BidProduct'
import NewProduct from './Components/Product/createNewProduct';
import ProductPage from './Components/Product/productPage';//Remove unnecessary paths after updating the pages so that only the relevant pages remain
import CataloguePage from './Components/Product/catalogue';
import UserProfilePage from './Components/User/profile';
import Badges from './Components/User/badges';
import { LoginProvider } from './Components/Login/logincontext';
import Login from './Components/Login/login';
const router = createBrowserRouter([
  {
    path:"/",
    element:<App/>
  },
  {
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
    element:<BidProduct/>
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
  }
  
])





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
