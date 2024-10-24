import React, { useState } from 'react';
import './Chatbot.css'; // Add styles if you have any

const Chatbot = ({ toggleChatWindow }) => {
  return (
    <div className="chat-window">
      <div className="chat-header">
        <span>Chat with us</span>
        <button className="close-button" onClick={toggleChatWindow}>X</button>
      </div>
      <div className="chat-body">
        <p>👋 Hi, message us with any questions. We're happy to help!</p>
      </div>
      <div className="chat-footer">
        <input type="text" placeholder="Write message" />
        <button className="send-button">→</button>
      </div>
    </div>
  );
};

export default Chatbot;
