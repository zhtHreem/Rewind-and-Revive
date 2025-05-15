import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Paper,
  Typography,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

const ProductCard = ({ product }) => {
  const { name, image, description, price, color, product_link } = product;

  return (
    <Card sx={{ display: 'flex', flexDirection: 'row', mb: 1, p: 1, width: 300 }}>
      {image && (
        <CardMedia
          component="img"
          sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover', mr: 1 }}
          image={image}
          alt={name}
        />
      )}
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Typography variant="body2" fontWeight="bold">{name}</Typography>
        {description && (
          <Typography variant="caption" color="text.secondary" noWrap>{description}</Typography>
        )}
        <Typography variant="caption">Rs{price} | Color: {color}</Typography>
        {product_link && (
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            <a
              href={product_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#8C5367', textDecoration: 'none' }}
            >
              View Product
            </a>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const Chatbot = ({ toggleChatWindow }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { text: "👋 Hi, drop your fashion-related queries. We will be happy to suggest you products!", sender: "bot" }
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('user_query', input);
      if (selectedFile) formData.append('image', selectedFile);

      const response = await fetch(`${process.env.REACT_APP_CHATBOT_API}/chat`, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
        body: formData,
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
      }

      if (Array.isArray(data.products) && data.products.length > 0) {
        const productMessages = data.products.map((product) => ({
          sender: "bot",
          component: <ProductCard key={product.name} product={product} />
        }));
        setMessages((prev) => [...prev, ...productMessages]);
      }

    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { text: "Something went wrong.", sender: "bot" }]);
    }

    setInput('');
    setSelectedFile(null);
    setLoading(false);
  };

  return (
    <Paper elevation={6} sx={{ width: 360, height: 540, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
      {/* Header with purple background */}
      <Box sx={{ p: 2, bgcolor: '#8C5367', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1">Chat with us</Typography>
        <IconButton onClick={toggleChatWindow} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Chat messages */}
      <Box sx={{ flex: 1, px: 1.5, py: 1, overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ mb: 1, alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.component || (
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: msg.sender === 'user' ? '#8C5367' : 'grey.200',
                  color: msg.sender === 'user' ? 'white' : 'initial',
                  borderRadius: 2,
                  maxWidth: '80%',
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            )}
          </Box>
        ))}
        {loading && (
          <Box sx={{ bgcolor: 'grey.100', p: 1.5, borderRadius: 2 }}>
            <Typography variant="body2">🕐 Processing your request...</Typography>
          </Box>
        )}
        <div ref={chatEndRef} />
      </Box>

      {/* Input, Upload, Send */}
      <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button
          variant="contained"
          component="label"
          sx={{ bgcolor: '#8C5367', '&:hover': { bgcolor: '#7a4659' }, color: 'white' }}
        >
          Upload
          <input hidden accept="image/*" type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
        </Button>
        <IconButton
          onClick={handleSendMessage}
          sx={{
            bgcolor: '#8C5367',
            color: 'white',
            '&:hover': { bgcolor: '#7a4659' },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default Chatbot;
