import { apiClient } from './axios';
import type { ChatRequest, ChatResponse, MessageSections } from '../types';
import { parseXmlResponse, isXmlResponse } from '../utils/xmlParser';
import { uuidv7 } from 'uuidv7';
import { getStoredToken } from './axios';

/**
 * Callback function for streaming updates
 */
export type StreamCallback = (data: {
  chunk: string;
  fullText: string;
  sections?: Partial<MessageSections>;
}) => void;

/**
 * Send a chat message with streaming support
 * @param message - User message text
 * @param articleId - Article UUID (generated if first message)
 * @param financerId - Financer ID
 * @param language - Language code (default: fr-BE)
 * @param selectedText - Selected text from canvas (optional)
 * @param onStream - Callback for streaming updates
 * @returns Promise with final chat response
 */
export const sendChatMessageStream = async (
  message: string,
  articleId: string,
  financerId: string,
  language: string = 'fr-BE',
  selectedText: string = '',
  onStream?: StreamCallback
): Promise<ChatResponse & { sections?: MessageSections }> => {
  const payload: ChatRequest = {
    prompt: message,
    selected_text: selectedText,
    language,
    financer_id: financerId,
  };

  // REAL API STREAMING
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';
  const endpoint = `${API_BASE_URL}/internal-communication/articles/${articleId}/chat`;
  const token = getStoredToken();

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Try to parse sections progressively
        const sections = parseStreamedXML(fullText);

        // Call streaming callback
        if (onStream) {
          onStream({
            chunk,
            fullText,
            sections,
          });
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  console.log('📨 API Response (streamed):', fullText);

  // Final parse
  let sections: MessageSections | undefined;
  if (isXmlResponse(fullText)) {
    try {
      sections = parseXmlResponse(fullText);
      console.log('✅ Parsed sections:', sections);
    } catch (error) {
      console.error('❌ Failed to parse XML response:', error);
    }
  }

  return {
    assistant: fullText,
    conversationId: articleId,
    sections,
  };
};

/**
 * Parse XML progressively as it streams in
 * Returns partial sections that are complete
 */
const parseStreamedXML = (text: string): Partial<MessageSections> => {
  const sections: Partial<MessageSections> = {};

  // Extract opening (if complete)
  const openingMatch = text.match(/<opening>([\s\S]*?)<\/opening>/);
  if (openingMatch) {
    sections.opening = openingMatch[1].trim();
  }

  // Extract title (if complete)
  const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/);
  if (titleMatch) {
    sections.title = titleMatch[1].trim();
  }

  // Extract content (even if incomplete, for progressive display)
  const contentStartMatch = text.match(/<content>([\s\S]*)/);
  if (contentStartMatch) {
    const contentText = contentStartMatch[1];
    const contentEndMatch = contentText.match(/([\s\S]*?)<\/content>/);
    if (contentEndMatch) {
      // Complete content
      sections.content = contentEndMatch[1].trim();
    } else {
      // Incomplete content - still streaming
      sections.content = contentText.trim();
    }
  }

  // Extract closing (if complete)
  const closingMatch = text.match(/<closing>([\s\S]*?)<\/closing>/);
  if (closingMatch) {
    sections.closing = closingMatch[1].trim();
  }

  return sections;
};

/**
 * Send a chat message to the assistant (non-streaming, for backward compatibility)
 * @param message - User message text
 * @param articleId - Article UUID (generated if first message)
 * @param financerId - Financer ID
 * @param language - Language code (default: fr-BE)
 * @param selectedText - Selected text from canvas (optional)
 * @returns Promise with chat response containing assistant message and optional canvas content
 * @throws AxiosError with error response data
 */
export const sendChatMessage = async (
  message: string,
  articleId: string,
  financerId: string,
  language: string = 'fr-BE',
  selectedText: string = ''
): Promise<ChatResponse & { sections?: MessageSections }> => {
  const payload: ChatRequest = {
    prompt: message,
    selected_text: selectedText,
    language,
    financer_id: financerId,
  };

  const endpoint = `/internal-communication/articles/${articleId}/chat`;
  const response = await apiClient.put<any>(endpoint, payload);

  console.log('📨 API Response:', response.data);

  // The API returns the XML content directly as a string, not in an object
  const xmlContent = typeof response.data === 'string' ? response.data : response.data.assistant || response.data;

  console.log('📝 XML Content:', xmlContent);

  // Try to parse XML response if it contains XML tags
  let sections: MessageSections | undefined;
  if (isXmlResponse(xmlContent)) {
    console.log('🔍 XML detected, parsing...');
    try {
      sections = parseXmlResponse(xmlContent);
      console.log('✅ Parsed sections:', sections);
    } catch (error) {
      console.error('❌ Failed to parse XML response:', error);
      // Continue with raw response if parsing fails
    }
  } else {
    console.log('⚠️ No XML tags detected in response');
  }

  return {
    assistant: xmlContent,
    conversationId: articleId,
    sections,
  };
};

/**
 * Generate a unique article ID using UUID v7
 * @returns New article UUID v7 string
 */
export const generateArticleId = (): string => {
  return uuidv7();
};

/**
 * Generate a unique conversation ID (legacy)
 * @returns New conversation ID string
 * @deprecated Use generateArticleId instead
 */
export const generateConversationId = (): string => {
  return `c_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
