// components/Layout.js
import React from 'react';
import Navbar from '../Navbar/navbar';
import Footer from '../Footer/footer';
import { ScrollRestoration } from 'react-router-dom';
import ReviLauncher from '../Chatbot/ReviLauncher';


const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ScrollRestoration />
      <ReviLauncher />
    </>
  );
};

export default Layout;
