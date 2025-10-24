import React, { useState, useEffect } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useChat } from '../../hooks/useChat';
import { Button } from '../UI/Button';
import { Toast } from '../UI/Toast';
import { saveArticle } from '../../api/articles';

type ViewMode = 'edit' | 'preview';

/**
 * Canvas panel component for editing and displaying content
 * Supports localStorage persistence and applying content from assistant
 */
export const CanvasPanel: React.FC = () => {
  const { content, title, setContent, applyFromAssistant, clearContent } = useCanvas();
  const { lastCanvasContent, articleId, financerId, language } = useChat();
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

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
   * Handle save article
   */
  const handleSave = async (showToastNotification = false) => {
    if (!title || !content) {
      setSaveError('Le titre et le contenu sont requis');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await saveArticle(articleId, title, content, financerId, language);
      setSaveSuccess(true);

      // Show toast if requested (for auto-save)
      if (showToastNotification) {
        setToastMessage('Article sauvegardé automatiquement !');
        setToastType('success');
        setShowToast(true);
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Failed to save article:', error);
      const errorMsg = error.response?.data?.message || 'Erreur lors de la sauvegarde';
      setSaveError(errorMsg);

      // Show error toast if requested
      if (showToastNotification) {
        setToastMessage(errorMsg);
        setToastType('error');
        setShowToast(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Listen for auto-save event from ChatContext
   */
  useEffect(() => {
    const handleAutoSave = () => {
      console.log('📥 Auto-save event received');
      handleSave(true); // Save with toast notification
    };

    window.addEventListener('auto-save-article', handleAutoSave);

    return () => {
      window.removeEventListener('auto-save-article', handleAutoSave);
    };
  }, [title, content, articleId, financerId, language]); // Re-create listener when these change

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
    <>
      {/* Toast notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex flex-col h-full bg-white">
      {/* Canvas header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {title || 'Canvas'}
            </h2>
            <p className="text-sm text-gray-600">
              {title ? 'Article généré par l\'assistant' : 'Contenu éditable'}
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

            {/* Save button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!content || !title || isSaving}
              isLoading={isSaving}
              aria-label="Save article"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

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

        {/* Success message */}
        {saveSuccess && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-medium text-green-800">
                Article sauvegardé avec succès!
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {saveError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium text-red-800">{saveError}</p>
              </div>
              <button
                type="button"
                onClick={() => setSaveError(null)}
                className="text-red-600 hover:text-red-700"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

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
          {content.length} caractères
        </p>
      </div>
    </div>
    </>
  );
};
