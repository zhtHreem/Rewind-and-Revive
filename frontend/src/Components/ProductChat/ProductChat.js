import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import "./ProductChat.css"; // Updated CSS

const socket = io(`${process.env.REACT_APP_LOCAL_URL}`);

const ProductChat = ({ productId, ownerId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId || decoded.id);
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!productId) return;

    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      console.log("Token:", token); // Log the token for debugging
      if (!token) {
        setError("You need to log in to use the chat.");
        return;
      }
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_LOCAL_URL}/api/chats/${productId}`,
          { headers: { Authorization: token } }
        );
        
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setError("Unable to load messages. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    

    fetchMessages();
    socket.emit("joinChat", { productId });

    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [productId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    const payload = { receiver: ownerId, product: productId, message: newMessage };
    const token = localStorage.getItem("token");
    console.log("Token for sending message:", token); // Log the token for debugging
  
    if (!token) {
      setError("You need to log in to send messages.");
      return;
    }
  
    try {
      await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/chats`, payload, {
        headers: { Authorization: token },
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Unable to send the message. Please try again later.");
    }
  };
  

  return (
    <div className="product-chat-container">
      <div className="chat-header">
        <h2>Chat with Seller</h2>
      </div>

      <div className="chat-messages">
        {isLoading ? (
          <p>Loading messages...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.sender._id === userId ? "self" : "other"}`}
            >
              <div className="message-content">
                <strong>
                  {msg.sender._id === userId ? "You" : msg.sender.username}:
                </strong>
                <p>{msg.message}</p>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ProductChat;