import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import mark from '../../assets/brand/mark-dark.svg';
import { formatMoney } from '../../utils/money';
import './chatbot.css';

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

// The whole card is one link that opens the product in a new tab.
const ProductCard = ({ product }) => {
  const { name, image, price, color, product_link } = product;
  return (
    <a
      className="cb-card"
      href={product_link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name}, ${formatMoney(price)}. Opens in a new tab`}
    >
      <span className="cb-card__photo">
        {image ? <img src={image} alt="" decoding="async" /> : null}
      </span>
      <span className="cb-card__body">
        <b>{name}</b>
        <span className="cb-card__meta">
          <i>{formatMoney(price)}</i>
          {color && <em>{color}</em>}
        </span>
      </span>
      <span className="cb-card__go" aria-hidden="true"><NorthEastIcon fontSize="inherit" /></span>
    </a>
  );
};

const GREETING = 'Hi, I\u2019m Revi, and I\u2019m so glad you\u2019re here. Tell me what you\u2019re looking for, or share a photo of a piece you love, and we\u2019ll find the perfect look together.';

const Chatbot = ({ toggleChatWindow }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ text: GREETING, sender: 'bot' }]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (loading || (!input.trim() && !selectedFile)) return;

    const query = input.trim();
    // the last few text messages give the stylist some memory of the conversation
    const history = messages
      .filter((m) => m.text)
      .slice(-6)
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'bot', text: m.text }));

    setMessages((prev) => [...prev, { text: query || '📷 Photo', sender: 'user' }]);
    setInput('');
    const file = selectedFile;
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = '';
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
        setMessages((prev) => [...prev, { text: data.error || "Revi couldn't answer just now.", sender: 'bot' }]);
      } else {
        const next = [];
        if (data.reply) next.push({ text: data.reply, sender: 'bot' });
        if (Array.isArray(data.products) && data.products.length > 0) next.push({ products: data.products, sender: 'bot' });
        setMessages((prev) => [...prev, ...next]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { text: "I couldn't connect just now. Check your connection and try again.", sender: 'bot' }]);
    }

    setLoading(false);
  };

  return (
    <div className="cb" role="dialog" aria-label="Revi, your style assistant">
      <header className="cb-head">
        <img src={mark} alt="" />
        <div>
          <b>Revi</b>
          <small>Your style assistant</small>
        </div>
        <button type="button" onClick={toggleChatWindow} aria-label="Close chat">
          <CloseIcon fontSize="small" />
        </button>
      </header>

      <div className="cb-feed" aria-live="polite">
        {messages.map((msg, index) =>
          msg.products ? (
            <div className="cb-cards" key={index}>
              {msg.products.map((p) => (
                <ProductCard key={p.product_link || p.name} product={p} />
              ))}
            </div>
          ) : (
            <div key={index} className={`cb-bubble cb-bubble--${msg.sender}`}>
              {msg.text}
            </div>
          )
        )}
        {loading && (
          <div className="cb-bubble cb-bubble--bot cb-typing" aria-label="Revi is typing">
            <span /><span /><span />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {selectedFile && (
        <div className="cb-attach">
          <PhotoCameraOutlinedIcon fontSize="small" />
          <span>{selectedFile.name}</span>
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => { setSelectedFile(null); if (fileRef.current) fileRef.current.value = ''; }}
          >
            <CloseIcon fontSize="inherit" />
          </button>
        </div>
      )}

      <form className="cb-input" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
        <label className={`cb-btn cb-btn--ghost ${selectedFile ? 'is-on' : ''}`} title="Upload a photo">
          <PhotoCameraOutlinedIcon fontSize="small" />
          <input
            ref={fileRef}
            hidden
            accept="image/jpeg,image/png,image/webp"
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0] || null)}
          />
        </label>
        <input
          className="cb-text"
          type="text"
          placeholder="Ask Revi anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          aria-label="Your message"
        />
        <button type="submit" className="cb-btn cb-btn--solid" disabled={loading || (!input.trim() && !selectedFile)} aria-label="Send">
          <SendIcon fontSize="small" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
