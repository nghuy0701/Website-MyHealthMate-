import React, { useRef, useEffect, useState } from 'react';
import { X, Send, Brain, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';

// Main Component
export function MiniChatWindow({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onQuickReply,
  quickReplies,
  isAiTyping,
  aiAvatar,
  aiName,
  onTypingChange,
  isSendingMessage,
  // unreadCount, // This prop is no longer used in the new UI
}) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [messageInput, setMessageInput] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
      onTypingChange(0); // Clear typing indicator
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    onTypingChange(e.target.value.length);
  };

  return (
    <>
      {/* Backdrop for closing on outside click */}
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}></div>}

      {/* Chat Window */}
      <div
        className={`fixed bg-white flex flex-col z-50 overflow-hidden transition-all duration-300 ease-out
                    inset-0 rounded-none
                    sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[360px] sm:h-[520px] sm:rounded-2xl sm:shadow-2xl
                    ${isOpen
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 pointer-events-none translate-y-full sm:translate-y-5'
                    }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 h-16 px-4 bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-between rounded-t-2xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-10 h-10 border-2 border-white flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500">
                <Brain className="w-6 h-6 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">AI Tư vấn y tế</h2>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-300"></span>
                </span>
                <p className="text-xs text-green-100">Trực tuyến 24/24</p>
              </div>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0 rounded-md hover:bg-green-700">
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
          {isAiTyping && <TypingIndicator senderName={aiName} />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 h-auto bg-white border-t border-gray-200">
          {quickReplies && quickReplies.length > 0 && (
            <div className="px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => onQuickReply(reply.payload)}
                  className="inline-flex items-center px-3 py-1.5 mr-2 text-xs font-medium text-gray-700 bg-transparent border border-green-200 rounded-full hover:bg-green-50 hover:border-green-300 transition-colors duration-150"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}
          <div className="p-3 pt-0 flex items-center gap-2">
            <Input
              ref={inputRef}
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi..."
              className="h-9 flex-1 rounded-full border-gray-300 focus:ring-green-500/20 focus:border-green-500 focus:ring-2"
              disabled={isSendingMessage}
            />
            <Button
              onClick={handleSend}
              className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
              size="icon"
              disabled={!messageInput.trim() || isSendingMessage}
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div >
    </>
  );
}

// Sub-component for Empty State, defined locally to avoid import issues.
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center mb-4">
        <Brain className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-2">AI Tư vấn y tế</h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        Tôi sẽ giúp bạn hiểu rõ về dự đoán nguy cơ tiểu đường
      </p>
    </div>
  );
}