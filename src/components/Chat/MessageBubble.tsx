import React from 'react';
import clsx from 'clsx';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

/**
 * Message bubble component to display user and assistant messages
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={clsx(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'max-w-[80%] rounded-lg px-4 py-3 shadow-sm',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        )}
      >
        {/* Message role label */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className={clsx(
              'text-xs font-semibold uppercase',
              isUser ? 'text-blue-100' : 'text-gray-500'
            )}
          >
            {isUser ? 'You' : 'Assistant'}
          </span>
          <span
            className={clsx(
              'text-xs',
              isUser ? 'text-blue-200' : 'text-gray-400'
            )}
          >
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Message text */}
        <div
          className={clsx(
            'text-sm whitespace-pre-wrap break-words',
            isUser ? 'text-white' : 'text-gray-800'
          )}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
};
