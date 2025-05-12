import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";

const socket = io(`${process.env.REACT_APP_LOCAL_URL}`);

const ProductChat = ({ productId, ownerId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const buyerIdFromQuery = searchParams.get("buyer");

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

  const isSeller = userId && String(userId) === String(ownerId);
  const buyerId = isSeller ? buyerIdFromQuery : userId;
  const sellerId = isSeller ? userId : ownerId;
  const receiverId = isSeller ? buyerId : ownerId;

  useEffect(() => {
    if (!buyerId || !sellerId || !productId) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_LOCAL_URL}/api/chats/${productId}/${buyerId}/${sellerId}`,
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );
        setMessages(data.messages || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error.response?.data || error.message);
        setError("Failed to load messages.");
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [buyerId, sellerId, productId]);

  useEffect(() => {
    if (!userId || !ownerId || !productId) return;
    socket.emit("registerUser", userId);
    return () => {
      socket.off("joinChat");
    };
  }, [userId, ownerId, productId]);

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      const isOwn = String(message.sender) === String(userId);
    
      // Patch live message sender structure if missing
      if (!message.sender || typeof message.sender === "string") {
        message.sender = {
          _id: message.sender,
          username: isOwn ? "You" : "Unknown", // fallback username
        };
      }
    
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId, receiverId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const payload = {
      sender: userId,
      receiver: receiverId,
      product: productId,
      message: newMessage.trim(),
    };

    const chatRoom = `chat_${productId}_${buyerId}_${sellerId}`;
    socket.emit("sendMessage", { ...payload, room: chatRoom });

    try {
      await axios.post(`${process.env.REACT_APP_LOCAL_URL}/api/chats`, payload, {
        headers: { Authorization: localStorage.getItem("token") },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Unable to send message.");
    }

    setNewMessage("");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 360,
        height: 500,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: "#8C5367", color: "white", px: 2, py: 1.5, textAlign: "center" }}>
        <Typography variant="h6" fontSize="1rem">
          {isSeller ? "Chat with Buyer" : "Chat with Seller"}
        </Typography>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          bgcolor: "#f9f9f9",
        }}
      >
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = String(msg.sender) === String(userId);
            return (
              <Box key={idx} display="flex" justifyContent={isOwn ? "flex-end" : "flex-start"} mb={1}>
                <Box
                  sx={{
                    bgcolor: isOwn ? "#8C5367" : "#e0e0e0",
                    color: isOwn ? "white" : "black",
                    borderRadius: 2,
                    p: 1,
                    maxWidth: "75%",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                  {isOwn
                    ? "You"
                    : typeof msg.sender === "object"
                      ? msg.sender.username || "Unknown"
                      : "Unknown"}

                  </Typography>
                  <Typography variant="body2">{msg.message}</Typography>
                  {msg.timestamp && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.5, display: "block", textAlign: "right" }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #ccc",
          px: 2,
          py: 1,
          bgcolor: "#fff",
          gap: 1,
        }}
      >
        <TextField
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          variant="outlined"
          InputProps={{
            sx: {
              height: 36,
              '& .MuiInputBase-input': {
                padding: '6px 8px',
              },
            },
          }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{
            height: 36,
            px: 2,
            fontSize: 14,
            bgcolor: "#8C5367",
            "&:hover": {
              bgcolor: "#7a475b",
            },
          }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ProductChat;
