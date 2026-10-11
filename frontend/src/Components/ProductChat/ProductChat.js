import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import "../Chatbot/chatbot.css";
import { Box,Typography, TextField, Button, Paper, CircularProgress, List, ListItem,ListItemText, Divider, Select, MenuItem, FormControl, InputLabel,} from "@mui/material";

let socket;

const ProductChat = ({ productId, ownerId, onClose }) => {
  const [messages, setMessages] = useState([]);
  // A message typed before logging in is kept (see SellerChatGate) and waits here.
  const draftStorageKey = `rr_chat_draft:${productId}`;
  const [newMessage, setNewMessage] = useState(() => {
    try { return sessionStorage.getItem(draftStorageKey) || ""; } catch { return ""; }
  });
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
  const buyerIdFromQuery = searchParams.get("chatPartnerId");

  // Initialize socket connection
  useEffect(() => {
    // Only initialize the socket once
    if (!socket) {
      socket = io(`${process.env.REACT_APP_LOCAL_URL}`);
      setSocketInitialized(true);
    }
    
    
    return () => {
     
      if (socket) {
        socket.off("receiveMessage");
      }
    };
  }, []);

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentUserId = decoded.userId || decoded.id;
        setUserId(currentUserId);
        
       
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
    
    if (!userId || !productId) {
      return;
    }
    
   
    if (String(userId) !== String(ownerId)) {
      
      return;
    }
    
  
    setLoadingBuyers(true);
    
    try {
    
      const url = `${process.env.REACT_APP_LOCAL_URL}/api/chats/product/buyers`;
     
      
      const response = await axios.post(
        url,
        { productId }, 
        {
          headers: { 
            Authorization: localStorage.getItem("token") 
          },
        }
      );
      
     
      
      if (response.data && response.data.buyers) {


     
        let sortedBuyers = [...response.data.buyers];
        
        if (buyerIdFromQuery) {
          sortedBuyers.sort((a, b) => {
            if (a._id === buyerIdFromQuery) return -1;
            if (b._id === buyerIdFromQuery) return 1;
            return 0;
          });
        }
        
        setBuyersList(sortedBuyers);
       
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

  
  const isSeller = userId && String(userId) === String(ownerId);
  
  
  const buyerId = isSeller ? (selectedBuyer || buyerIdFromQuery || '') : userId;
  const sellerId = isSeller ? userId : ownerId;
  const receiverId = isSeller ? buyerId : ownerId;


  useEffect(() => {
    
    if (!userId || (!buyerId && isSeller) || !sellerId || !productId) {
      
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
        
        
        setMessages(data.messages || []);
        
       
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


const [isChatOpen, setIsChatOpen] = useState(false);


const openChatFromQuery = searchParams.get("openChat") === "true";


useEffect(() => {

  if (openChatFromQuery) {
    setIsChatOpen(true);
  }
}, [openChatFromQuery, location.search]); 

useEffect(() => {
 
  const handleLocationChange = () => {
    const currentParams = new URLSearchParams(window.location.search);
    const shouldOpenChat = currentParams.get("openChat") === "true";
    setIsChatOpen(shouldOpenChat);
    
    
    const partnerId = currentParams.get("chatPartnerId");
    if (partnerId && buyersList.some(b => b._id === partnerId)) {
      setSelectedBuyer(partnerId);
    }
  };

  window.addEventListener("popstate", handleLocationChange);
  
  return () => {
    window.removeEventListener("popstate", handleLocationChange);
  };
}, [buyersList]);


useEffect(() => {
  if (!userId || !socket) return;
  
  
  socket.off("receiveMessage");
  
  
  socket.on("receiveMessage", (receivedMessage) => {
  
    
  
    if (!receivedMessage || !receivedMessage.product) {
    
      return;
    }
    
    
    if (receivedMessage.product === productId) {
      const messageSenderId = receivedMessage.sender?._id;
      
      // Validate the sender ID exists
      if (!messageSenderId) {
        
        return;
      }
      
      
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
          
          const createMsgFingerprint = (msg) => {
            return `${msg.message}-${String(msg.sender?._id || msg.sender)}-${msg.timestamp || ''}`;
          };
          
          
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
 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keep what is being typed, and forget it once it is sent.
  useEffect(() => {
    try {
      if (newMessage) sessionStorage.setItem(draftStorageKey, newMessage);
      else sessionStorage.removeItem(draftStorageKey);
    } catch { /* storage unavailable */ }
  }, [newMessage, draftStorageKey]);


  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !receiverId || !productId || !socket) return;

    try {
      
      const payload = {
        senderId: userId,
        receiverId: receiverId,
        productId: productId,
        message: newMessage.trim(),
      };
      
     
      const tempMessage = {
        sender: { _id: userId, username: "You" },
        message: newMessage.trim(),
        timestamp: new Date(),
        _id: `temp-${Date.now()}`, 
        isTemp: true 
      };
      
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      
      setNewMessage("");
      
    
      const { data } = await axios.post(
        `${process.env.REACT_APP_LOCAL_URL}/api/chats`, 
        payload, 
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      
     
      setMessages(prevMessages => {
     
        const filteredMessages = prevMessages.filter(msg => !msg.isTemp);
        
        
        const messageExists = filteredMessages.some(msg => 
          (data.messageData && msg._id === data.messageData._id) ||
          (data.messageData && msg.message === data.messageData.message && 
           String(msg.sender?._id || msg.sender) === String(data.messageData.sender?._id || data.messageData.sender))
        );
        
        if (!messageExists && data.messageData) {
       
          return [...filteredMessages, data.messageData];
        }
        
        return filteredMessages;
      });
      

    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
      
      
      setMessages(prevMessages => prevMessages.filter(msg => !msg.isTemp));
      
      setError("Unable to send message. Please try again.");
    }
  };

  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const partnerName = chatPartner || (isSeller ? 'Buyer' : 'Seller');

  return (
    <div className="cb cb--seller" role="dialog" aria-label={`Chat with ${partnerName}`}>
      <header className="cb-head">
        <span className="cb-avatar" aria-hidden="true">{partnerName.charAt(0).toUpperCase()}</span>
        <div>
          <b>{partnerName}</b>
          <small>{isSeller ? 'Buyer' : 'Seller'} &middot; about this piece</small>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close chat">
            <CloseIcon fontSize="small" />
          </button>
        )}
      </header>

      {isSeller && (
        <div className="cb-select">
          <label htmlFor="cb-buyer">Chatting with</label>
          <select id="cb-buyer" value={selectedBuyer} onChange={(e) => setSelectedBuyer(e.target.value)} disabled={loadingBuyers}>
            {loadingBuyers ? (
              <option value="">Loading buyers&hellip;</option>
            ) : buyersList.length === 0 ? (
              <option value="">No buyers yet</option>
            ) : (
              <>
                <option value="" disabled>Choose a buyer</option>
                {buyersList.map((buyer) => (
                  <option key={buyer._id} value={buyer._id}>
                    {(buyer.username || 'Unknown buyer').split(' ').slice(0, 3).join(' ')}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      )}

      <div className="cb-feed" aria-live="polite">
        {isLoading ? (
          <div className="cb-state">Loading the conversation&hellip;</div>
        ) : error ? (
          <div className="cb-state cb-state--error">{error}</div>
        ) : messages.length === 0 ? (
          <div className="cb-state">No messages yet. Say hello and ask about fit, condition or shipping.</div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = String(msg.sender?._id || msg.sender) === String(userId);
            return (
              <div
                key={msg._id || `msg-${idx}`}
                className={`cb-bubble cb-bubble--${isOwn ? 'user' : 'bot'} ${msg.isTemp ? 'is-pending' : ''}`}
              >
                {msg.message}
                {msg.timestamp && (
                  <time>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="cb-input" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
        <input
          className="cb-text"
          type="text"
          placeholder="Write a message…"
          value={newMessage}
          onChange={(e) => { setNewMessage(e.target.value); if (error) setError(null); }}
          maxLength={1000}
          aria-label="Your message"
        />
        <button type="submit" className="cb-btn cb-btn--solid" disabled={isLoading || !newMessage.trim()} aria-label="Send">
          <SendIcon fontSize="small" />
        </button>
      </form>
    </div>
  );
};

export default ProductChat;