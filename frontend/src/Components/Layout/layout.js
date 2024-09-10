// components/Layout.js
import React from 'react';
import Navbar from '../Navbar/navbar';
import Footer from '../Footer/footer';


const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
