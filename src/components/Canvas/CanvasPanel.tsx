import React, { useState } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useChat } from '../../hooks/useChat';
import { Button } from '../UI/Button';

type ViewMode = 'edit' | 'preview';

/**
 * Canvas panel component for editing and displaying content
 * Supports localStorage persistence and applying content from assistant
 */
export const CanvasPanel: React.FC = () => {
  const { content, setContent, applyFromAssistant, clearContent } = useCanvas();
  const { lastCanvasContent } = useChat();
  const [viewMode, setViewMode] = useState<ViewMode>('edit');

  /**
   * Handle textarea change
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  /**
   * Apply content from last assistant response
   */
  const handleApplyFromAssistant = () => {
    if (lastCanvasContent) {
      applyFromAssistant(lastCanvasContent);
    }
  };

  /**
   * Render markdown-like preview (simple version)
   * In a production app, you would use a library like react-markdown
   */
  const renderPreview = (text: string) => {
    // Simple preview that preserves formatting
    return text.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-3 mb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-2 mb-1">{line.substring(4)}</h3>;
      }

      // Code blocks
      if (line.startsWith('```')) {
        return <div key={index} className="bg-gray-800 text-gray-100 px-3 py-1 rounded font-mono text-sm my-2">{line.substring(3)}</div>;
      }

      // Bullet points
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4">{line.substring(2)}</li>;
      }

      // Inline code
      const codeRegex = /`([^`]+)`/g;
      if (codeRegex.test(line)) {
        const parts = line.split(codeRegex);
        return (
          <p key={index} className="mb-2">
            {parts.map((part, i) =>
              i % 2 === 1 ?
                <code key={i} className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">{part}</code> :
                part
            )}
          </p>
        );
      }

      // Empty line
      if (line.trim() === '') {
        return <br key={index} />;
      }

      // Normal paragraph
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Canvas header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Canvas</h2>
            <p className="text-sm text-gray-600">
              Editable content area with auto-save
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Edit mode"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Preview mode"
              >
                Preview
              </button>
            </div>

            {/* Clear button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={clearContent}
              disabled={!content}
              aria-label="Clear canvas"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Apply from assistant button */}
        {lastCanvasContent && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-blue-700">
                  The assistant has provided content for the canvas
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyFromAssistant}
                aria-label="Apply content from assistant"
              >
                Apply to Canvas
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas content area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'edit' ? (
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Start typing or apply content from the assistant..."
            className="w-full h-full px-6 py-4 resize-none border-0 focus:outline-none focus:ring-0
                     scrollbar-thin font-mono text-sm"
            aria-label="Canvas content editor"
          />
        ) : (
          <div className="h-full overflow-y-auto px-6 py-4 scrollbar-thin prose prose-sm max-w-none">
            {content ? (
              <div className="text-gray-800">
                {renderPreview(content)}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No content
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Switch to edit mode to start creating content
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="flex-shrink-0 px-6 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {content.length} characters • Auto-saved to localStorage
        </p>
      </div>
    </div>
  );
};
