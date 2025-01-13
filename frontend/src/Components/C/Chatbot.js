import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Chatbot.css';

const socket = io(`${process.env.REACT_APP_LOCAL_URL}`, {
    transports: ['websocket'] // Ensures proper WebSocket transport
});

const Chatbot = ({ toggleChatWindow }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { text: "👋 Hi, message us with any questions. We're happy to help!", sender: "bot" }
    ]);

    // ✅ Added useEffect here to handle incoming messages and clean up event listeners
    useEffect(() => {
        // Listen for messages from the server
        socket.on('receiveMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Cleanup event listener to prevent memory leaks
        return () => {
            socket.off('receiveMessage');
        };
    }, []); // Empty dependency array ensures this runs only once on component mount

    const handleInputChange = (event) => {
        setInput(event.target.value);
    };

    const handleSendMessage = () => {
        if (input.trim() === '') return;

        const newMessage = { text: input, sender: "user" };
        setMessages((prev) => [...prev, newMessage]);  // Update local state for instant feedback
        socket.emit('sendMessage', newMessage); // Send message to the server
        setInput('');
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
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="chat-footer">
                <input 
                    type="text" 
                    value={input} 
                    onChange={handleInputChange} 
                    placeholder="Write a message..." 
                />
                <button className="send-button" onClick={handleSendMessage}>→</button>
            </div>
        </div>
    );
};

export default Chatbot;
