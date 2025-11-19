import React from 'react';
import { useChatContext } from '../context/ChatContext';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';

const ChatWidget = () => {
  const { isOpen } = useChatContext();

  return (
    <>
      {!isOpen && <ChatButton />}
      <ChatPanel />
    </>
  );
};

export default ChatWidget;
