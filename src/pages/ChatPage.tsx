import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-100 pt-16 pb-12 px-4">
      <div className="container mx-auto max-w-6xl py-4">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;