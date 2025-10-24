import React, { createContext, useState, useCallback, useContext } from 'react';
import { sendChatMessageStream, generateArticleId } from '../api/chat';
import { CanvasContext } from './CanvasContext';
import type { Message } from '../types';

interface ChatContextValue {
  articleId: string;
  messages: Message[];
  pending: boolean;
  error: string | null;
  lastCanvasContent: string | null;
  financerId: string;
  language: string;
  sendMessage: (text: string, selectedText?: string) => Promise<void>;
  clearError: () => void;
  clearMessages: () => void;
  setFinancerId: (id: string) => void;
  setLanguage: (lang: string) => void;
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
  const canvasContext = useContext(CanvasContext);
  const [articleId] = useState<string>(() => generateArticleId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCanvasContent, setLastCanvasContent] = useState<string | null>(null);
  const [financerId, setFinancerId] = useState<string>('19780701-d123-4e8a-80cd-21f35d4a0113');
  const [language, setLanguage] = useState<string>('fr-BE');

  /**
   * Generate a unique message ID
   */
  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  /**
   * Send a message to the assistant
   */
  const sendMessage = useCallback(async (text: string, selectedText: string = ''): Promise<void> => {
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
      console.log('🚀 Sending message to API with streaming...');

      // Clear Canvas before starting new message
      if (canvasContext) {
        canvasContext.setTitle('');
        canvasContext.setContent('');
      }

      // Create a placeholder assistant message for streaming
      const assistantMessageId = generateMessageId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        text: '',
        sections: undefined,
        createdAt: Date.now(),
      };

      // Add placeholder message immediately
      setMessages((prev) => [...prev, assistantMessage]);

      // Send message with streaming callback
      const response = await sendChatMessageStream(
        text.trim(),
        articleId,
        financerId,
        language,
        selectedText,
        (streamData) => {
          // Update message text in real-time
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, text: streamData.fullText, sections: streamData.sections as any }
                : msg
            )
          );

          // Stream content to Canvas in real-time
          if (streamData.sections && canvasContext) {
            if (streamData.sections.title) {
              const cleanTitle = streamData.sections.title.replace(/^#\s*/, '');
              canvasContext.setTitle(cleanTitle);
            }
            if (streamData.sections.content) {
              canvasContext.setContent(streamData.sections.content);
            }
          }
        }
      );

      console.log('✉️ Response received (final):', response);

      // Update with final parsed sections
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, text: response.assistant, sections: response.sections }
            : msg
        )
      );

      // Auto-save article after streaming is complete
      if (response.sections && canvasContext) {
        console.log('💾 Triggering auto-save after streaming...');
        // Trigger save event that Canvas will listen to
        window.dispatchEvent(new CustomEvent('auto-save-article'));
      }

      // Store canvas content if provided (legacy support)
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
  }, [articleId, financerId, language]);

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
    articleId,
    messages,
    pending,
    error,
    lastCanvasContent,
    financerId,
    language,
    sendMessage,
    clearError,
    clearMessages,
    setFinancerId,
    setLanguage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
