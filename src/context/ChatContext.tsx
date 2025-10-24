import React, { createContext, useState, useCallback } from 'react';
import { sendChatMessage, generateConversationId } from '../api/chat';
import type { Message } from '../types';

interface ChatContextValue {
  conversationId: string;
  messages: Message[];
  pending: boolean;
  error: string | null;
  lastCanvasContent: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
  clearMessages: () => void;
}

export const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
}

/**
 * Chat provider component that manages chat state
 * Handles sending messages, receiving responses, and managing conversation
 */
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversationId] = useState<string>(() => generateConversationId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCanvasContent, setLastCanvasContent] = useState<string | null>(null);

  /**
   * Generate a unique message ID
   */
  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  /**
   * Send a message to the assistant
   */
  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) {
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      text: text.trim(),
      createdAt: Date.now(),
    };

    // Add user message optimistically
    setMessages((prev) => [...prev, userMessage]);
    setPending(true);
    setError(null);

    try {
      // Send message to API
      const response = await sendChatMessage(text.trim(), conversationId);

      // Create assistant message
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        text: response.assistant,
        createdAt: Date.now(),
      };

      // Add assistant message to state
      setMessages((prev) => [...prev, assistantMessage]);

      // Store canvas content if provided
      if (response.canvasContent) {
        setLastCanvasContent(response.canvasContent);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to send message. Please try again.';
      setError(errorMessage);

      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));

      throw new Error(errorMessage);
    } finally {
      setPending(false);
    }
  }, [conversationId]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastCanvasContent(null);
  }, []);

  const value: ChatContextValue = {
    conversationId,
    messages,
    pending,
    error,
    lastCanvasContent,
    sendMessage,
    clearError,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
