import { create } from 'zustand';
import { notificationAPI } from './api';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8017';

/**
 * Centralized Notification Store
 * Manages all notifications with realtime updates
 */
export const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isDrawerOpen: false,
  activeFilter: 'all', // 'all' | 'chat' | 'prediction' | 'alert' | 'reminder' | 'article'
  socket: null,
  currentConversationId: null,

  // Initialize socket connection
  initSocket: (userId) => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      auth: { userId },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[NotificationStore] Socket connected:', socket.id);
    });

    socket.on('notification:new', (data) => {
      const { notification } = data;
      console.log('[NotificationStore] New notification:', notification);
      
      // Check if should suppress (e.g., chat notification for current conversation)
      const currentConversationId = get().currentConversationId;
      if (notification.type === 'chat' && 
          notification.deepLink?.query?.conversationId === currentConversationId) {
        console.log('[NotificationStore] Suppressing notification for current conversation');
        return;
      }
      
      get().addNotification(notification);
    });

    socket.on('disconnect', () => {
      console.log('[NotificationStore] Socket disconnected');
    });

    set({ socket });
  },

  // Disconnect socket
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  // Load notifications from API
  loadNotifications: async (userRole) => {
    try {
      set({ isLoading: true });
      const response = await notificationAPI.getMyNotifications();
      const notifications = response.data || [];
      
      // Filter by user role
      const filteredNotifications = notifications.filter(n => 
        !n.role || n.role === userRole
      );
      
      set({ 
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.isRead).length
      });
    } catch (error) {
      console.error('[NotificationStore] Error loading notifications:', error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        set({ notifications: [], unreadCount: 0 });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // Load unread count
  loadUnreadCount: async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      set({ unreadCount: response.data?.count || 0 });
    } catch (error) {
      console.error('[NotificationStore] Error loading unread count:', error);
    }
  },

  // Add new notification (realtime)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.description,
        icon: '/logo.png'
      });
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      
      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('[NotificationStore] Error marking as read:', error);
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await notificationAPI.markAllAsRead();
      
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('[NotificationStore] Error marking all as read:', error);
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      
      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.isRead;
        
        return {
          notifications: state.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });
    } catch (error) {
      console.error('[NotificationStore] Error deleting notification:', error);
    }
  },

  // Get filtered notifications
  getFilteredNotifications: () => {
    const { notifications, activeFilter } = get();
    
    if (activeFilter === 'all') {
      return notifications;
    }
    
    return notifications.filter(n => n.type === activeFilter);
  },

  // Drawer controls
  openDrawer: () => {
    set({ isDrawerOpen: true });
    // Auto mark all as read when opening drawer
    const unreadCount = get().unreadCount;
    if (unreadCount > 0) {
      get().markAllAsRead();
    }
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false });
  },

  // Set active filter
  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
  },

  // Set current conversation (for suppression)
  setCurrentConversationId: (conversationId) => {
    set({ currentConversationId: conversationId });
  },

  // Clear all state (on logout)
  clearAll: () => {
    get().disconnectSocket();
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isDrawerOpen: false,
      activeFilter: 'all',
      socket: null,
      currentConversationId: null
    });
  }
}));
