import React, { createContext, useState, useEffect, useCallback } from 'react';

interface CanvasContextValue {
  content: string;
  setContent: (content: string) => void;
  applyFromAssistant: (text: string) => void;
  clearContent: () => void;
}

export const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

interface CanvasProviderProps {
  children: React.ReactNode;
}

// LocalStorage key for canvas content persistence
const CANVAS_STORAGE_KEY = 'canvas_content';

/**
 * Canvas provider component that manages canvas state
 * Handles content editing, persistence to localStorage, and applying assistant content
 */
export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [content, setContentState] = useState<string>('');

  // Load content from localStorage on mount
  useEffect(() => {
    const storedContent = localStorage.getItem(CANVAS_STORAGE_KEY);
    if (storedContent) {
      setContentState(storedContent);
    }
  }, []);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CANVAS_STORAGE_KEY, content);
  }, [content]);

  /**
   * Update canvas content
   */
  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
  }, []);

  /**
   * Apply content from assistant response
   * Can be customized to merge or replace based on requirements
   */
  const applyFromAssistant = useCallback((text: string) => {
    // For now, we replace the content
    // In a more advanced version, you might want to merge or append
    setContentState(text);
  }, []);

  /**
   * Clear all canvas content
   */
  const clearContent = useCallback(() => {
    setContentState('');
  }, []);

  const value: CanvasContextValue = {
    content,
    setContent,
    applyFromAssistant,
    clearContent,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};
