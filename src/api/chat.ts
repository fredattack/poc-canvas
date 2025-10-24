import { apiClient } from './axios';
import type { ChatRequest, ChatResponse } from '../types';

/**
 * Send a chat message to the assistant
 * @param message - User message text
 * @param conversationId - Current conversation ID
 * @returns Promise with chat response containing assistant message and optional canvas content
 * @throws AxiosError with error response data
 */
export const sendChatMessage = async (
  message: string,
  conversationId: string
): Promise<ChatResponse> => {
  const payload: ChatRequest = {
    message,
    conversationId,
  };

  const response = await apiClient.post<ChatResponse>('/chat', payload);
  return response.data;
};

/**
 * Generate a unique conversation ID
 * @returns New conversation ID string
 */
export const generateConversationId = (): string => {
  return `c_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
