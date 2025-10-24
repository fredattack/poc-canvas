// Authentication types
export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CognitoAuthenticationResult {
  AccessToken: string;
  ExpiresIn: number;
  TokenType: string;
  RefreshToken: string;
  IdToken: string;
}

export interface LoginResponse {
  response: string;
  authentication_result: CognitoAuthenticationResult;
}

// Chat types
export interface MessageSections {
  opening: string;
  title: string;
  content: string;
  closing: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sections?: MessageSections; // Structured sections for assistant messages
  createdAt: number;
}

export interface ChatState {
  conversationId: string;
  messages: Message[];
  pending: boolean;
  error?: string;
  lastCanvasContent?: string; // Canvas content from last assistant response
}

export interface ChatRequest {
  prompt: string;
  selected_text: string;
  language: string;
  financer_id: string;
}

export interface ChatResponse {
  assistant: string;
  conversationId: string;
  canvasContent?: string;
}

// Canvas types
export interface CanvasState {
  content: string;
}

// Error response type
export interface ErrorResponse {
  error: string;
}
