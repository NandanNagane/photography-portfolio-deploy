import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

const ChatButton = () => {
  const { openChat } = useChatContext();

  return (
    <motion.button
      onClick={openChat}
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1a] text-white shadow-lg hover:bg-[#111827] transition-colors"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
      aria-label="Open chat"
    >
      <MessageCircle className="h-6 w-6" />
    </motion.button>
  );
};

export default ChatButton;
