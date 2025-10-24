import { useContext } from 'react';
import { CanvasContext } from '../context/CanvasContext';

/**
 * Custom hook to access canvas context
 * Must be used within CanvasProvider
 * @returns Canvas context value with content, setContent, and related functions
 */
export const useCanvas = () => {
  const context = useContext(CanvasContext);

  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }

  return context;
};
