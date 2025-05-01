import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Chatbot.css';

const socket = io(`${process.env.REACT_APP_LOCAL_URL}`, {
  transports: ['websocket'],
});

const Chatbot = ({ toggleChatWindow }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { text: "👋 Hi, message us with any questions. We're happy to help!", sender: "bot" }
  ]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const handleInputChange = (e) => setInput(e.target.value);
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return;
  
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
  
    try {
      const formData = new FormData();
      formData.append('user_query', input);
      if (selectedFile) formData.append('image', selectedFile);
  
      const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/chat`, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
        body: formData,
      });
  
      const data = await response.json();
  
      // 👇 Log what backend sends back
      console.log("🤖 Backend:", data);
  
      if (data.reply) {
        setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
      }
  
      if (Array.isArray(data.products) && data.products.length > 0) {
        const productMessages = data.products.map((product) => ({
          sender: "bot",
          component: (
            <div style={{ textAlign: 'left' }}>
              <strong>{product.name}</strong>
              <p>{product.description}</p>
              <a href={product.image} target="_blank" rel="noreferrer">
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '120px',
                    borderRadius: '8px',
                    marginTop: '8px',
                  }}
                />
              </a>
            </div>
          ),
        }));
  
        setMessages((prev) => [...prev, ...productMessages]);
      }
  
    } catch (error) {
      console.error("❌ Error fetching chat response:", error);
      setMessages((prev) => [...prev, { text: "Sorry, something went wrong.", sender: "bot" }]);
    }
  
    setInput('');
    setSelectedFile(null);
  };
  

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span>Chat with us</span>
        <button className="close-button" onClick={toggleChatWindow}>X</button>
      </div>

      <div className="chat-body">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.component || <p>{msg.text}</p>}
          </div>
        ))}
      </div>

      <div className="chat-footer">
        <input type="text" value={input} onChange={handleInputChange} placeholder="Write a message..." />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button className="send-button" onClick={handleSendMessage}>→</button>
      </div>
    </div>
  );
};

export default Chatbot;
