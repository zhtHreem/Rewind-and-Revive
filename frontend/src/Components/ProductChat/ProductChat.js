import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./ProductChat.css";

const socket = io(`${process.env.REACT_APP_LOCAL_URL}`);

const ProductChat = ({ productId, ownerId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Decode Token for User ID
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

  // ✅ Fetch messages from the backend
  useEffect(() => {
    if (!userId || !ownerId || !productId) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_LOCAL_URL}/api/chats/${productId}/${userId}/${ownerId}`,
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );

        console.log("📥 Chat Data Loaded:", data);
        setMessages(data.messages || []);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error fetching messages:", error.response?.data || error.message);
        setError("Failed to load messages.");
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [userId, ownerId, productId]);

  // ✅ Join chat room (Buyer-Seller specific)
  useEffect(() => {
    if (!userId || !ownerId || !productId) return;

    socket.emit("registerUser", userId); // Register user when chat opens

    return () => {
      socket.off("joinChat");
    };
  }, [userId, ownerId, productId]);

  // ✅ Listen for real-time incoming messages
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      console.log("📥 Received Message:", message);

      if (
        (String(message.sender) === String(userId) && String(message.receiver) === String(ownerId)) ||
        (String(message.sender) === String(ownerId) && String(message.receiver) === String(userId))
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId, ownerId]);

  // ✅ Send Messages with correct sender & receiver info
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const payload = {
      sender: userId,
      receiver: ownerId,
      product: productId,
      message: newMessage.trim(),
    };

    const chatRoom = `chat_${productId}_${userId}_${ownerId}`;
    socket.emit("sendMessage", { ...payload, room: chatRoom });

    try {
      const response = await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/chats`, payload, {
        headers: { Authorization: localStorage.getItem("token") },
      });

      console.log("✅ Message sent response:", response.data);
    } catch (error) {
      console.error("❌ Error sending message:", {
        status: error?.response?.status,
        message: error?.response?.data || error.message,
      });

      setError(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Unable to send the message. Please try again later."
      );
    }

    setNewMessage(""); // Clear input after sending
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
              className={`chat-message ${String(msg.sender) === String(userId) ? "self" : "other"}`}
            >
              <div className="message-content">
                <strong>
                  {String(msg.sender) === String(userId) ? "You" : msg.sender.username}:
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
