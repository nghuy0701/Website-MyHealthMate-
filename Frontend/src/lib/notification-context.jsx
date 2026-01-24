import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationAPI } from './api';
import { useAuth } from './auth-context';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8017';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef(null);
  const currentConversationIdRef = useRef(null);

  // Update current conversation ID from ChatPage
  const setCurrentConversationId = useCallback((conversationId) => {
    currentConversationIdRef.current = conversationId;
    console.log('[Notifications] Current conversation set to:', conversationId);
  }, []);

  // Handle new notification from Socket.IO
  const handleNewNotification = useCallback((data) => {
    const { notification } = data;
    console.log('[Notifications] Received new notification:', notification);
    
    // Check if we should suppress this notification
    // (e.g., if it's a chat notification for currently open conversation)
    const isCurrentConversation = notification.type === 'chat' && 
      notification.meta?.conversationId === currentConversationIdRef.current;
    
    if (isCurrentConversation) {
      console.log('[Notifications] Suppressing notification for current conversation');
      return;
    }
    
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.description,
        icon: '/logo.png'
      });
    }
  }, []);

  // Initialize Socket.IO connection for notifications
  const userId = user?._id?.toString() || user?.id?.toString();

  useEffect(() => {
    if (!userId) {
      console.log('[Notifications] No user, skipping socket initialization');
      return;
    }

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: {
        userId: userId
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Notifications] Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Notifications] Socket disconnected');
    });

    socket.on('notification:new', handleNewNotification);

    // Cleanup
    return () => {
      console.log('[Notifications] Cleaning up socket connection');
      socket.off('notification:new', handleNewNotification);
      socket.disconnect();
    };
  }, [userId, handleNewNotification]);

  // Load notifications on mount - only if user is authenticated
  useEffect(() => {
    if (user && userId) {
      console.log('[Notifications] Loading notifications for user:', userId);
      loadNotifications();
      loadUnreadCount();
    } else {
      console.log('[Notifications] No user or userId, skipping load. user:', !!user, 'userId:', userId);
      // Clear state when no user
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, userId]);

  const loadNotifications = async () => {
    if (!user || !userId) {
      console.log('[Notifications] No user, skipping load notifications');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await notificationAPI.getMyNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('[Notifications] Error loading notifications:', error);
      // Don't show error to user if not authenticated
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('[Notifications] User not authenticated, clearing notifications');
        setNotifications([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user || !userId) {
      console.log('[Notifications] No user, skipping load unread count');
      return;
    }
    
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (error) {
      console.error('[Notifications] Error loading unread count:', error);
      // Don't show error to user if not authenticated
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('[Notifications] User not authenticated, setting count to 0');
        setUnreadCount(0);
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[Notifications] Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('[Notifications] Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      
      // Update local state
      const wasUnread = notifications.find(n => n.id === notificationId)?.isRead === false;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[Notifications] Error deleting notification:', error);
    }
  };

  const openDrawer = () => {
    setIsOpen(true);
    // Mark all as read when opening drawer
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    setCurrentConversationId,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    openDrawer,
    closeDrawer
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
