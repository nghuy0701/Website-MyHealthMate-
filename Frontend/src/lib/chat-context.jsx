import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const getConversation = useCallback((conversationId) => {
    return conversations.find((c) => c.id === conversationId);
  }, [conversations]);

  const getMessages = useCallback((conversationId) => {
    return messages[conversationId] || [];
  }, [messages]);

  const sendMessage = useCallback((conversationId, content, attachments = []) => {
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'current-user-id', // Should be from auth context
      content,
      attachments,
      createdAt: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));
  }, []);

  const markAsRead = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, []);

  const value = {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    getConversation,
    getMessages,
    sendMessage,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
