import React, { useState } from 'react';
import '../Navbar/navbar.css';
import Navbar from '../Navbar/navbar'; 
import Footer from '../Footer/footer'; 
import './ContactUs.css'; 

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
  };

  return (
    <>
      <Navbar /> 
      <div className="contact-us">
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Get in Touch</h2>
          <div className="form-group">
            <div className="icon-input">
              <i className="fas fa-user"></i> {/* Icon for Name */}
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <div className="icon-input">
              <i className="fas fa-envelope"></i> {/* Icon for Email */}
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <div className="icon-input">
              <i className="fas fa-comment"></i> {/* Icon for Message */}
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" className="send-btn">Submit</button>
        </form>
      </div>
      <Footer /> {/* Including the footer */}
    </>
  );
};

export default ContactUs;
