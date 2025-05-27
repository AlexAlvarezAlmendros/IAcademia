
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Course, Message } from '../types';
import { geminiService } from '../services/geminiService';
import { courseService } from '../services/courseService';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';
import { SendIcon, ArrowLeftIcon } from './icons';

interface ChatScreenProps {
  course: Course;
  onBack: () => void;
}

const TYPING_SPEED_MS = 30; // Milliseconds per character for typing animation
const MAX_TEXTAREA_ROWS = 6; // Max number of lines before textarea scrolls

const ChatScreen: React.FC<ChatScreenProps> = ({ course, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [chatSession, setChatSession] = useState<ReturnType<typeof geminiService.createChatSession> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textarea.scrollHeight;
      
      const computedStyle = getComputedStyle(textarea);
      const lineHeight = parseFloat(computedStyle.lineHeight) || (parseFloat(computedStyle.fontSize) * 1.2); // Estimate line height if not set
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);
      const borderTop = parseFloat(computedStyle.borderTopWidth);
      const borderBottom = parseFloat(computedStyle.borderBottomWidth);
      
      const singleRowHeight = lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
      const maxHeight = (lineHeight * MAX_TEXTAREA_ROWS) + paddingTop + paddingBottom + borderTop + borderBottom;

      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
      if (textarea.value === '') {
         textarea.style.height = `${singleRowHeight}px`; // Approximate single line height
         textarea.style.overflowY = 'hidden';
      }
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [userInput, adjustTextareaHeight]);


  // Typing animation effect
  useEffect(() => {
    const typingIntervals = new Map<string, NodeJS.Timeout>();

    messages.forEach(msg => {
      if (msg.sender === 'ai' && msg.isTypingAnimated && msg.fullText && msg.text.length < msg.fullText.length) {
        if (!typingIntervals.has(msg.id)) {
          const intervalId = setInterval(() => {
            if (!isMounted.current) {
              clearInterval(intervalId);
              typingIntervals.delete(msg.id);
              return;
            }
            setMessages(prevMsgs =>
              prevMsgs.map(m => {
                if (m.id === msg.id && m.isTypingAnimated && m.fullText && m.text.length < m.fullText.length) {
                  const nextCharIndex = m.text.length;
                  return { ...m, text: m.fullText.substring(0, nextCharIndex + 1) };
                }
                if (m.id === msg.id && m.isTypingAnimated && m.fullText && m.text.length >= m.fullText.length) {
                  clearInterval(intervalId);
                  typingIntervals.delete(msg.id);
                  return { ...m, isTypingAnimated: m.isStreamingApi }; 
                }
                return m;
              })
            );
          }, TYPING_SPEED_MS);
          typingIntervals.set(msg.id, intervalId);
        }
      } else if (msg.sender === 'ai' && msg.isTypingAnimated && msg.fullText && msg.text.length >= msg.fullText.length && !msg.isStreamingApi) {
         if (isMounted.current) {
            setMessages(prevMsgs => prevMsgs.map(m => m.id === msg.id ? { ...m, isTypingAnimated: false } : m));
         }
        if (typingIntervals.has(msg.id)) {
          clearInterval(typingIntervals.get(msg.id)!);
          typingIntervals.delete(msg.id);
        }
      }
    });

    return () => {
      typingIntervals.forEach(intervalId => clearInterval(intervalId));
    };
  }, [messages]);


  const initializeChat = useCallback(async () => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setIsAiResponding(true);
    setError(null);
    
    try {
      const systemPrompt = courseService.generateSystemPrompt(course);
      const session = geminiService.createChatSession(systemPrompt);
      setChatSession(session);

      if (isMounted.current) {
        setMessages([{
          id: Date.now().toString() + '_system_init',
          text: `Starting your lesson on "${course.title}". Your AI tutor, ${course.aiPersona.split(',')[0]}, will guide you.`,
          sender: 'system',
          timestamp: new Date()
        }]);
      }
      
      const initialAiMessageId = Date.now().toString() + '_ai_init';
      if (isMounted.current) {
        setMessages(prev => [...prev, {
          id: initialAiMessageId,
          text: '',
          fullText: '',
          sender: 'ai',
          timestamp: new Date(),
          isStreamingApi: true,
          isTypingAnimated: true,
        }]);
      }

      const initialResponseStream = await session.sendMessageStream({ message: "Hello! Please introduce yourself and the first topic." });
      
      for await (const chunk of initialResponseStream) {
        if (!isMounted.current) break;
        setMessages(prev => prev.map(msg => 
            msg.id === initialAiMessageId 
            ? {...msg, fullText: (msg.fullText || '') + chunk.text } 
            : msg
        ));
      }

      if (isMounted.current) {
         setMessages(prev => prev.map(msg => 
            msg.id === initialAiMessageId 
            ? {...msg, isStreamingApi: false, isTypingAnimated: (msg.text !== msg.fullText) } 
            : msg
         ));
      }

    } catch (e: any) {
      console.error("Failed to initialize chat:", e);
      if (isMounted.current) {
        setError(e.message || "Failed to start chat session. Check your API key and network connection.");
        const errorAiMsgId = Date.now().toString() + '_ai_error_init';
        setMessages(prev => [...prev, {
          id: errorAiMsgId,
          text: "Sorry, I couldn't start our session. Please check your connection or try refreshing.",
          fullText: "Sorry, I couldn't start our session. Please check your connection or try refreshing.",
          sender: 'ai',
          timestamp: new Date(),
          isStreamingApi: false,
          isTypingAnimated: false,
        }]);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [course]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);
  
  useEffect(() => {
    const anyAiMessageAnimatingOrStreaming = messages.some(
      (msg) => msg.sender === 'ai' && (msg.isTypingAnimated || msg.isStreamingApi)
    );
    if (isMounted.current) {
      setIsAiResponding(anyAiMessageAnimatingOrStreaming);
    }
  }, [messages]);


  useEffect(() => {
    if (chatHistoryRef.current) {
        // With flex-col-reverse, scrollHeight is still the total height.
        // Scrolling to scrollHeight effectively scrolls to the "bottom" of the visual content (which is the newest).
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || isAiResponding || !chatSession) return;

    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      text: userInput.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    if (!isMounted.current) return;
    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput.trim();
    setUserInput(''); // Clear input, which will trigger adjustTextareaHeight via useEffect
    setIsLoading(true);
    setIsAiResponding(true);
    setError(null);

    const aiMessageId = Date.now().toString() + '_ai_response';
    if (isMounted.current) {
      setMessages(prev => [...prev, {
        id: aiMessageId,
        text: '',
        fullText: '',
        sender: 'ai',
        timestamp: new Date(),
        isStreamingApi: true,
        isTypingAnimated: true,
      }]);
    }
    
    try {
      const responseStream = await chatSession.sendMessageStream({ message: currentInput });
      for await (const chunk of responseStream) {
        if (!isMounted.current) break;
        setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
            ? {...msg, fullText: (msg.fullText || '') + chunk.text } 
            : msg
        ));
      }
       if (isMounted.current) {
         setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
            ? {...msg, isStreamingApi: false, isTypingAnimated: (msg.text !== msg.fullText) } 
            : msg
         ));
      }

    } catch (e: any) {
      console.error("Failed to send message:", e);
       if (isMounted.current) {
        setError(e.message || "Failed to get response from AI. Please try again.");
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
          ? {...msg, 
             text: "Sorry, I encountered an error trying to respond. Please try sending your message again.",
             fullText: "Sorry, I encountered an error trying to respond. Please try sending your message again.",
             isStreamingApi: false, 
             isTypingAnimated: false 
            }
          : msg
        ));
      }
    } finally {
       if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleTextareaKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <header className={`flex items-center justify-between p-4 shadow-md text-white ${course.themeColor || 'bg-indigo-600'}`}>
        <button 
          onClick={onBack} 
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Back to course selection"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div className="text-center">
            <h2 className="text-xl font-semibold">{course.title}</h2>
            <p className="text-xs opacity-80">Tutor: {course.aiPersona.split(',')[0]}</p>
        </div>
        <div className="w-10 h-10"> {/* Spacer */} </div>
      </header>

      <div 
        ref={chatHistoryRef} 
        className="flex-grow overflow-y-auto p-4 bg-slate-800 flex flex-col-reverse gap-4"
      >
        {/* Placeholder for reversed messages. Iterating normally, but flex-col-reverse handles visual order.
            The initial messages will be at the "top" of this reversed flow (visually bottom).
            To make it truly bottom-up visually, the array itself doesn't need reversing if CSS handles it.
         */}
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isAiResponding && !messages.some(m => m.sender === 'ai' && (m.isTypingAnimated || m.isStreamingApi)) && (
            <div className="flex justify-start w-full"> {/* w-full to align with message bubbles */}
                <div className="flex items-center space-x-2 bg-slate-700 text-white p-3 rounded-lg rounded-bl-none max-w-xs lg:max-w-md shadow">
                <LoadingSpinner size="sm" />
                <span>{course.aiPersona.split(',')[0]} is thinking...</span>
                </div>
            </div>
        )}
      </div>

      {error && (
        <div className="p-2 sm:p-4">
          <Alert type="error" title="Communication Error">{error}</Alert>
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="p-2 sm:p-4 bg-slate-900 border-t border-slate-700"
      >
        <div className="flex items-end space-x-2"> {/* Use items-end to align button with bottom of textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleTextareaKeyPress}
            placeholder="Send a message..."
            aria-label="Chat input"
            className="flex-grow p-3 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow disabled:opacity-70 resize-none overflow-hidden"
            disabled={isLoading || isAiResponding}
          />
          <button
            type="submit"
            disabled={isLoading || isAiResponding || !userInput.trim()}
            aria-label="Send message"
            className={`p-3 rounded-lg text-white transition-all duration-150 ease-in-out self-end flex-shrink-0 h-[48px] w-[48px] flex items-center justify-center
                        ${(isLoading || isAiResponding || !userInput.trim()) ? 'bg-slate-600 cursor-not-allowed opacity-70' : `${course.themeColor || 'bg-indigo-600'} hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-${course.themeColor ? course.themeColor.split('-')[1] + '-500' : 'indigo-500'}`}`}
          >
            <SendIcon className="h-6 w-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatScreen;
