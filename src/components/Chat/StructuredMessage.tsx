import React from 'react';
import type { MessageSections } from '../../types';

interface StructuredMessageProps {
  sections: MessageSections;
  timestamp: number;
}

/**
 * Structured message component with separate containers for each XML section
 * Displays opening, title, content, and closing in distinct visual blocks
 */
export const StructuredMessage: React.FC<StructuredMessageProps> = ({ sections, timestamp }) => {
  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Don't render if sections are not available yet
  if (!sections || !sections.opening) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 w-full mb-4">
      {/* Opening Section */}
      {sections.opening && (
        <div className="flex justify-start w-full">
          <div className="max-w-[85%] rounded-lg px-5 py-4 shadow-md bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase text-blue-700">Assistant</span>
              <span className="text-xs text-blue-400">{formatTime(timestamp)}</span>
            </div>
            <div className="text-sm text-gray-800 leading-relaxed">
              {sections.opening}
            </div>
          </div>
        </div>
      )}

      {/* Closing Section */}
      {sections.closing && (
        <div className="flex justify-start w-full">
          <div className="max-w-[85%] rounded-lg px-5 py-4 shadow-md bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase text-green-700">Question de Suivi</span>
            </div>
            <div className="text-sm text-gray-800 leading-relaxed">
              {sections.closing}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
