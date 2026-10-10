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

// Shrinks a photo to at most 1024px on its longest side as a JPEG, so uploads stay small.
const shrinkImage = (file) =>
  new Promise((resolve) => {
    if (!file || file.size < 700 * 1024) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

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
        <Typography variant="caption">${price} | Color: {color}</Typography>
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
    { text: "👋 Hi! Ask me what to wear, or upload a photo of a piece and I’ll suggest what goes with it.", sender: "bot" }
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (loading || (!input.trim() && !selectedFile)) return;

    const query = input.trim();
    // the last few text messages give the stylist some memory of the conversation
    const history = messages
      .filter((m) => m.text)
      .slice(-6)
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'bot', text: m.text }));

    setMessages((prev) => [...prev, { text: query || '\uD83D\uDCF7 Photo', sender: "user" }]);
    setInput('');
    const file = selectedFile;
    setSelectedFile(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('user_query', query);
      formData.append('history', JSON.stringify(history));
      if (file) formData.append('image', await shrinkImage(file), 'photo.jpg');

      const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/chatbot/chat`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessages((prev) => [...prev, { text: data.error || "The stylist couldn't answer just now.", sender: "bot" }]);
      } else {
        if (data.reply) setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
        if (Array.isArray(data.products) && data.products.length > 0) {
          const productMessages = data.products.map((product) => ({
            sender: "bot",
            component: <ProductCard key={product.name} product={product} />,
          }));
          setMessages((prev) => [...prev, ...productMessages]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { text: "I couldn't reach the stylist. Check your connection and try again.", sender: "bot" }]);
    }

    setLoading(false);
  };

  return (
<Paper
  elevation={6}
  sx={{
    width: { xs: '100vw', sm: 360 },
    height: { xs: '100vh', sm: 440 },
    borderRadius: { xs: 0, sm: 2 },
    display: 'flex',
    flexDirection: 'column',
  }}
>
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
              <Box sx={{  p: 1.5,  bgcolor: msg.sender === 'user' ? '#8C5367' : 'grey.200',  color: msg.sender === 'user' ? 'white' : 'initial', borderRadius: 2, maxWidth: '80%', }} >
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
        <TextField fullWidth size="small"  placeholder="Type your message..."  value={input}  onChange={(e) => setInput(e.target.value)}  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
        <Button  variant="contained"   component="label" sx={{ bgcolor: '#8C5367', '&:hover': { bgcolor: '#7a4659' }, color: 'white' }}>
          {selectedFile ? 'Photo \u2713' : 'Upload'}
          <input hidden accept="image/jpeg,image/png,image/webp" type="file" onChange={(e) => setSelectedFile(e.target.files[0] || null)} />
        </Button>
        <IconButton onClick={handleSendMessage} sx={{  bgcolor: '#8C5367',    color: 'white',   '&:hover': { bgcolor: '#7a4659' },}} >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default Chatbot;
