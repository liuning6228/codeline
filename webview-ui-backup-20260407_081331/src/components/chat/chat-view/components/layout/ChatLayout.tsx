/**
 * ChatLayout - Main chat layout component
 * Based on Cline's chat layout structure
 */

import React from 'react';

interface ChatLayoutProps {
  children: React.ReactNode;
  isHidden?: boolean;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children, isHidden }) => {
  return (
    <div
      className={`flex flex-col h-full w-full ${
        isHidden ? 'hidden' : ''
      }`}
      style={{
        display: isHidden ? 'none' : 'flex',
      }}
    >
      {children}
    </div>
  );
};

export default ChatLayout;
