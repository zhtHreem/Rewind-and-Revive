import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import { Box,Typography, TextField, Button, Paper, CircularProgress, List, ListItem,ListItemText, Divider, Select, MenuItem, FormControl, InputLabel,} from "@mui/material";

// Create socket instance outside component but initialize it properly in useEffect
let socket;

const ProductChat = ({ productId, ownerId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const messagesEndRef = useRef(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [buyersList, setBuyersList] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [loadingBuyers, setLoadingBuyers] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const buyerIdFromQuery = searchParams.get("buyer");

  // Initialize socket connection
  useEffect(() => {
    // Only initialize the socket once
    if (!socket) {
      socket = io(`${process.env.REACT_APP_LOCAL_URL}`);
      setSocketInitialized(true);
    }
    
    // Clean up function
    return () => {
      // Don't disconnect the socket here as it should persist across the app
      // Just clean up listeners to avoid memory leaks
      if (socket) {
        socket.off("receiveMessage");
      }
    };
  }, []);

  // Decode token and set userId when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentUserId = decoded.userId || decoded.id;
        setUserId(currentUserId);
        
        // Authenticate with socket when we have userId
        if (socket && currentUserId) {
          socket.emit("authenticate", currentUserId);
        }
      } catch (error) {
        console.error("Failed to decode token", error);
        setError("Authentication failed. Please try logging in again.");
      }
    } else {
      setError("Please log in to use the chat feature.");
    }
  }, [socketInitialized]);
 
 


useEffect(() => {
  const fetchBuyers = async () => {
    // Make sure we have the required data
    if (!userId || !productId) {
      return;
    }
    
    // Check if user is the seller
    if (String(userId) !== String(ownerId)) {
      
      return;
    }
    
  
    setLoadingBuyers(true);
    
    try {
      // Use POST request with the productId in the body instead of URL params
      const url = `${process.env.REACT_APP_LOCAL_URL}/api/chats/product/buyers`;
     
      
      const response = await axios.post(
        url,
        { productId }, // Send productId in the request body
        {
          headers: { 
            Authorization: localStorage.getItem("token") 
          },
        }
      );
      
     
      
      if (response.data && response.data.buyers) {
        setBuyersList(response.data.buyers);
        
        // Auto-select buyer from query param or first buyer in list
        if (buyerIdFromQuery && response.data.buyers.some(b => b._id === buyerIdFromQuery)) {
          setSelectedBuyer(buyerIdFromQuery);
        } else if (response.data.buyers.length > 0) {
          setSelectedBuyer(response.data.buyers[0]._id);
        }
      }
      setLoadingBuyers(false);
    } catch (error) {
      console.error("Error fetching buyers:", error.response?.data || error.message);
      setLoadingBuyers(false);
    }
  };
  
  fetchBuyers();
}, [userId, ownerId, productId, buyerIdFromQuery]);

  // Determine if current user is seller or buyer
  const isSeller = userId && String(userId) === String(ownerId);
  
  // Use the selected buyer from dropdown for sellers, or the query param as fallback
  const buyerId = isSeller ? (selectedBuyer || buyerIdFromQuery || '') : userId;
  const sellerId = isSeller ? userId : ownerId;
  const receiverId = isSeller ? buyerId : ownerId;

  // Fetch messages for this specific chat 
  useEffect(() => {
    // For sellers, we need a valid buyerId to fetch chat
    if (!userId || (!buyerId && isSeller) || !sellerId || !productId) {
      // If we're missing data but we're the seller, we might need to show a buyer selection UI
      if (isSeller && !buyerId) {
        setIsLoading(false);
        setError(null);
        setMessages([]);
        return;
      }
      return;
    }

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        
        // If seller with no specific buyer selected, don't try to fetch messages
        if (isSeller && !buyerId) {
          setIsLoading(false);
          return;
        }
        
        const { data } = await axios.get(
          `${process.env.REACT_APP_LOCAL_URL}/api/chats/${productId}/${buyerId}/${sellerId}`,
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );
        
        // If we have data, set messages, otherwise initialize empty array
        setMessages(data.messages || []);
        
        // Get chat partner name
        if (isSeller) {
          setChatPartner(data.buyer?.username || 'Buyer');
        } else {
          setChatPartner(data.seller?.username || 'Seller');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error.response?.data || error.message);
        setError("Failed to load messages. Please refresh and try again.");
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [userId, buyerId, sellerId, productId, isSeller]);

 

// Listen for new messages via socket.io
useEffect(() => {
  if (!userId || !socket) return;
  
  // Clean up any previous listeners to avoid duplicates
  socket.off("receiveMessage");
  
  // Listen for messages that are meant for this specific chat
  socket.on("receiveMessage", (receivedMessage) => {
  
    
    // Check for required fields
    if (!receivedMessage || !receivedMessage.product) {
    
      return;
    }
    
    // Only process messages if they belong to this product
    if (receivedMessage.product === productId) {
      const messageSenderId = receivedMessage.sender?._id;
      
      // Validate the sender ID exists
      if (!messageSenderId) {
        
        return;
      }
      
      // For product page chat, we need to be more lenient with which messages we show
      // If this is a chat between the current user and our chat partner, show it
      const isCurrentUserInvolved = 
        String(userId) === String(messageSenderId) || 
        String(userId) === String(receivedMessage.receiver);
      
      const chatPartnerInvolved = 
        String(receiverId) === String(messageSenderId) || 
        String(receiverId) === String(receivedMessage.receiver);
      
      const isRelevantToCurrentChat = isCurrentUserInvolved && chatPartnerInvolved;
      
      console.log("Message relevant to current chat?", isRelevantToCurrentChat, {
        userId,
        messageSenderId,
        receiverId,
        receivedMsgReceiver: receivedMessage.receiver
      });
      
      if (isRelevantToCurrentChat) {
        setMessages(prevMessages => {
          // Create a more reliable message ID for comparison
          const createMsgFingerprint = (msg) => {
            return `${msg.message}-${String(msg.sender?._id || msg.sender)}-${msg.timestamp || ''}`;
          };
          
          // Check if message already exists to prevent duplicates
          // Use both ID and content-based matching
          const messageExists = prevMessages.some(msg => 
            (msg._id && receivedMessage._id && msg._id === receivedMessage._id) || 
            createMsgFingerprint(msg) === createMsgFingerprint(receivedMessage)
          );
          
          if (messageExists) {
          
            return prevMessages;
          }
          
         
          return [...prevMessages, receivedMessage];
        });
      }
    }
  });

  return () => {
    if (socket) socket.off("receiveMessage");
  };
}, [userId, receiverId, productId, socket]);
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !receiverId || !productId || !socket) return;

    try {
      // Create message payload
      const payload = {
        senderId: userId,
        receiverId: receiverId,
        productId: productId,
        message: newMessage.trim(),
      };
      
      // Create a temporary message object for immediate UI update
      const tempMessage = {
        sender: { _id: userId, username: "You" },
        message: newMessage.trim(),
        timestamp: new Date(),
        _id: `temp-${Date.now()}`, // Temporary ID to identify this message
        isTemp: true // Mark as temporary
      };
      
      // Update UI immediately
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Clear input field
      setNewMessage("");
      
      // Send message via API
      const { data } = await axios.post(
        `${process.env.REACT_APP_LOCAL_URL}/api/chats`, 
        payload, 
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      
      // Remove temporary message and add the real one from server if needed
      setMessages(prevMessages => {
        // Remove the temporary message
        const filteredMessages = prevMessages.filter(msg => !msg.isTemp);
        
        // Check if the real message is already in the list (from socket)
        const messageExists = filteredMessages.some(msg => 
          (data.messageData && msg._id === data.messageData._id) ||
          (data.messageData && msg.message === data.messageData.message && 
           String(msg.sender?._id || msg.sender) === String(data.messageData.sender?._id || data.messageData.sender))
        );
        
        if (!messageExists && data.messageData) {
          // Add the real message from the server
          return [...filteredMessages, data.messageData];
        }
        
        return filteredMessages;
      });
      
      // Socket already emits from the server so we don't need to emit here
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
      
      // Remove the temp message on error
      setMessages(prevMessages => prevMessages.filter(msg => !msg.isTemp));
      
      setError("Unable to send message. Please try again.");
    }
  };

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Paper elevation={3} sx={{  width: 360,  height: 500,  display: "flex", flexDirection: "column",  overflow: "hidden", }}>
      {/* Header */}
      <Box sx={{ bgcolor: "#8C5367", color: "white", px: 2, py: 1.5, textAlign: "center" }}>
        <Typography variant="h6" fontSize="1rem">
          {isSeller 
            ? `Chat with ${chatPartner || 'Buyer'}`
            : `Chat with ${chatPartner || 'Seller'}`}
        </Typography>
      </Box>
      
      {/* Buyer selector for sellers */}
      {isSeller && (
        <Box sx={{ px: 2, py: 1, bgcolor: "#f5f5f5" }}>
          <FormControl fullWidth size="small">
            <InputLabel id="buyer-select-label">Select Buyer</InputLabel>
            <Select
              labelId="buyer-select-label"   value={selectedBuyer} label="Select Buyer" onChange={(e) => setSelectedBuyer(e.target.value)}   disabled={loadingBuyers} >
              {loadingBuyers ? (
                <MenuItem value="">  <em>Loading buyers...</em></MenuItem>
              ) : buyersList.length === 0 ? (
                <MenuItem value="">   <em>No buyers available</em>  </MenuItem>
              ) : (
                buyersList.map((buyer) => (
                  <MenuItem key={buyer._id} value={buyer._id}>  {(() => {
                               const nameParts = (buyer.username || 'Unknown Buyer').split(' ');
                               const displayName = nameParts.slice(0, 3).join(' ');
                               return displayName;
                  })()} </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Messages */}
      <Box   sx={{ flex: 1,  overflowY: "auto",   p: 2,   bgcolor: "#f9f9f9",  display: "flex", overflowX: "hidden", flexDirection: "column" }}  >
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">  {error} </Typography>
        ) : messages.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="text.secondary">  No messages yet. Send a message to start the conversation. </Typography>
          </Box>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = String(msg.sender?._id || msg.sender) === String(userId);
            
            return (
              <Box  key={msg._id || `msg-${idx}`}   display="flex"   justifyContent={isOwn ? "flex-end" : "flex-start"}   mb={1}  sx={msg.isTemp ? { opacity: 0.7 } : {}} >
                <Box sx={{   bgcolor: isOwn ? "#8C5367" : "#e0e0e0",  color: isOwn ? "white" : "black",   borderRadius: 2,  p: 1,  maxWidth: "75%", wordBreak: "break-word", overflowWrap: "break-word" }}  >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {isOwn     ? "You"    : typeof msg.sender === "object"   ? msg.sender?.username || "Unknown" : "Unknown"}
                  </Typography>
                  <Typography variant="body2">{msg.message}</Typography>
                  {msg.timestamp && (
                    <Typography  variant="caption"   sx={{ mt: 0.5, display: "block", textAlign: "right" }} >
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
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box  sx={{  display: "flex",  alignItems: "center",   borderTop: "1px solid #ccc",   px: 2,  py: 1,bgcolor: "#fff",  gap: 1,}} >
        <TextField   placeholder="Type a message..."  value={newMessage}  onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress}  variant="outlined" fullWidth  InputProps={{  sx: {  height: 36, '& .MuiInputBase-input': {    padding: '6px 8px',    },   },  }} sx={{ flex: 1 }} disabled={isLoading || !!error} />
        <Button  variant="contained"  onClick={sendMessage} disabled={isLoading || !!error || !newMessage.trim()}  sx={{  height: 36, px: 2,  fontSize: 14, bgcolor: "#8C5367", "&:hover": {   bgcolor: "#7a475b",  },   }} >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ProductChat;