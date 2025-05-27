
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const TYPING_CURSOR = '▋';

  if (isSystem) {
    return (
      <div className="text-center w-full"> {/* Ensure full width for proper centering within flex-col-reverse gap */}
        <span className="px-3 py-1 text-xs text-slate-400 bg-slate-700 rounded-full shadow">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`p-3 rounded-lg shadow w-full md:w-auto md:max-w-[calc(100%-2rem)]  ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-br-none ml-auto' 
            : 'bg-slate-700 text-slate-100 rounded-bl-none mr-auto'
        }`}
      >
        {isUser ? (
          <p className="text-base whitespace-pre-wrap break-words">
            {message.text}
          </p>
        ) : (
          // AI Message
          <div className="markdown-content break-words">
            {message.isStreamingApi && !message.text && !message.fullText && (
              <LoadingSpinner size="xs" inline={true} className="mr-1" />
            )}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text + (message.isTypingAnimated ? TYPING_CURSOR : '')}
            </ReactMarkdown>
          </div>
        )}
        {!(message.sender === 'ai' && (message.isTypingAnimated || message.isStreamingApi) && !message.text) && (
             <p className={`text-xs mt-2 ${isUser ? 'text-indigo-200' : 'text-slate-400'} text-right`}>
             {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
