import React, { useState } from 'react';
import './ChatFeature.css'; // Import the corresponding CSS file

const ChatFeature = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Function to toggle chat window visibility
  const toggleChatWindow = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div>
      {/* Chat button */}
      <div className="chat-button" onClick={toggleChatWindow}>
        <span className="chat-icon">💬</span>
        <span className="chat-text">Chat</span>
      </div>

      {/* Chat window */}
      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-user-info">
              
              <div className="chat-user-details">
                <strong>Seller</strong>
              </div>
            </div>
            <button className="close-chat" onClick={toggleChatWindow}>✖</button>
          </div>

          <div className="chat-body">
            {/* No messages to display, this part is now empty */}
          </div>

          <div className="chat-footer">
            <input type="text" placeholder="Write a message..." className="chat-input" />
            <button className="send-button">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatFeature;
