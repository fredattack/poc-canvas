import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

/**
 * Custom hook to access chat context
 * Must be used within ChatProvider
 * @returns Chat context value with sendMessage, messages, and chat state
 */
export const useChat = () => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
};
