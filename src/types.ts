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

export interface LoginResponse {
  token: string;
  user: User;
}

// Chat types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
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
  message: string;
  conversationId: string;
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
