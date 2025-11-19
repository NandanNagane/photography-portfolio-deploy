import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMessages } from '../services/chatApi';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(() => {
    // Check if session ID exists in localStorage
    let existingSessionId = localStorage.getItem('photography_chat_session_id');

    if (!existingSessionId) {
      // Generate new session ID: device fingerprint + timestamp
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const browserInfo = `${navigator.userAgent.slice(0, 20)}`.replace(
        /[^a-z0-9]/gi,
        ''
      );
      
      existingSessionId = `session_${browserInfo}_${timestamp}_${randomId}`;

      // Store in localStorage to persist across page reloads
      localStorage.setItem('photography_chat_session_id', existingSessionId);
    }

    return existingSessionId;
  });

  // Load messages when component mounts
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await getMessages(sessionId);
        if (data && data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          // Set welcome message if no previous messages
          setMessages([
            {
              role: 'assistant',
              content:
                "Welcome to our photography studio! I'm here to help you explore our portfolio, learn about our services, and discuss your photography needs. How can I assist you today?",
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Set welcome message on error
        setMessages([
          {
            role: 'assistant',
            content:
              "Welcome to our photography studio! I'm here to help you explore our portfolio, learn about our services, and discuss your photography needs. How can I assist you today?",
          },
        ]);
      }
    };

    loadMessages();
  }, [sessionId]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const openChat = () => {
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const value = {
    isOpen,
    messages,
    sessionId,
    toggleChat,
    openChat,
    closeChat,
    addMessage,
    setMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
