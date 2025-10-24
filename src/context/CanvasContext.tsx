import React, { createContext, useState, useEffect, useCallback } from 'react';

interface CanvasContextValue {
  content: string;
  title: string;
  setContent: (content: string) => void;
  setTitle: (title: string) => void;
  applyFromAssistant: (text: string, title?: string) => void;
  clearContent: () => void;
}

export const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

interface CanvasProviderProps {
  children: React.ReactNode;
}

// LocalStorage keys for canvas content persistence
const CANVAS_STORAGE_KEY = 'canvas_content';
const CANVAS_TITLE_KEY = 'canvas_title';

/**
 * Canvas provider component that manages canvas state
 * Handles content editing, persistence to localStorage, and applying assistant content
 */
export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [content, setContentState] = useState<string>('');
  const [title, setTitleState] = useState<string>('');

  // No longer load from localStorage - start fresh on each page load
  // Content is only filled by streaming from the assistant

  // Optional: Clear localStorage on mount to ensure fresh start
  useEffect(() => {
    localStorage.removeItem(CANVAS_STORAGE_KEY);
    localStorage.removeItem(CANVAS_TITLE_KEY);
  }, []);

  /**
   * Update canvas content
   */
  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
  }, []);

  /**
   * Update canvas title
   */
  const setTitle = useCallback((newTitle: string) => {
    setTitleState(newTitle);
  }, []);

  /**
   * Apply content from assistant response
   * Can be customized to merge or replace based on requirements
   */
  const applyFromAssistant = useCallback((text: string, newTitle?: string) => {
    // For now, we replace the content
    // In a more advanced version, you might want to merge or append
    setContentState(text);
    if (newTitle) {
      setTitleState(newTitle);
    }
  }, []);

  /**
   * Clear all canvas content
   */
  const clearContent = useCallback(() => {
    setContentState('');
    setTitleState('');
  }, []);

  const value: CanvasContextValue = {
    content,
    title,
    setContent,
    setTitle,
    applyFromAssistant,
    clearContent,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};
