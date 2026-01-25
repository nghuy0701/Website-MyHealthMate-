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
    if (!userId) {
      console.warn('[NotificationStore] ❌ No userId provided to initSocket');
      return;
    }

    console.log('[NotificationStore] 🔌 Initializing socket for userId:', userId);

    const socket = io(SOCKET_URL, {
      auth: { userId },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[NotificationStore] ✅ Socket connected:', socket.id);
      console.log('[NotificationStore] 📡 Socket auth userId:', userId);
      console.log('[NotificationStore] 🏠 Socket will receive notifications on room:', userId);
    });

    socket.on('notification:new', (data) => {
      console.log('[NotificationStore] 🔔 Socket event notification:new received:', data);
      const { notification } = data;
      console.log('[NotificationStore] Notification details:', notification);
      
      // Check if should suppress (e.g., chat notification for current conversation)
      const currentConversationId = get().currentConversationId;
      console.log('[NotificationStore] Current conversation ID:', currentConversationId);
      
      if (notification.type === 'chat' && 
          notification.deepLink?.query?.conversationId === currentConversationId) {
        console.log('[NotificationStore] ⛔ Suppressing notification for current conversation');
        return;
      }
      
      console.log('[NotificationStore] ✅ Adding notification to store');
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
    if (!userRole) {
      console.warn('[NotificationStore] ❌ No user role provided');
      return;
    }
    
    try {
      set({ isLoading: true });
      console.log('[NotificationStore] 📡 Fetching notifications from API for role:', userRole);
      
      const response = await notificationAPI.getMyNotifications();
      console.log('[NotificationStore] 📦 API Response:', response);
      
      const notifications = response.data || [];
      console.log('[NotificationStore] 📊 Received', notifications.length, 'notifications from backend');
      
      // Backend already filters by role, so use data directly
      console.log('[NotificationStore] ✅ Using', notifications.length, 'notifications (backend filtered)');
      
      set({ 
        notifications: notifications,
        unreadCount: notifications.filter(n => !n.isRead).length
      });
      
      console.log('[NotificationStore] ✅ State updated successfully');
    } catch (error) {
      console.error('[NotificationStore] ❌ Error loading notifications:', error);
      console.error('[NotificationStore] Error details:', error.message);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('[NotificationStore] User not authenticated');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // Load unread count
  loadUnreadCount: async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      const count = response.data?.count || 0;
      console.log('[NotificationStore] Unread count:', count);
      set({ unreadCount: count });
    } catch (error) {
      console.error('[NotificationStore] Error loading unread count:', error);
      // Don't set to 0, keep existing value
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
      // Update UI immediately (optimistic update)
      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.isRead;
        
        return {
          notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });
      
      // Then call API in background
      await notificationAPI.markAsRead(notificationId);
      console.log('[NotificationStore] Marked notification as read:', notificationId);
    } catch (error) {
      console.error('[NotificationStore] Error marking as read:', error);
      // Rollback on error
      get().loadNotifications(get().notifications[0]?.role);
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      // Update UI immediately
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
      
      // Then call API in background
      await notificationAPI.markAllAsRead();
      console.log('[NotificationStore] Marked all notifications as read');
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

  // Get filtered notifications - DO FILTERING IN STORE
  getFilteredNotifications: () => {
    const { notifications, activeFilter } = get();
    
    console.log('[NotificationStore] Filtering notifications:', {
      total: notifications.length,
      activeFilter
    });
    
    // If no notifications from API and on "All" tab, show welcome notification
    if (notifications.length === 0 && activeFilter === 'all') {
      const welcomeNotification = {
        id: 'welcome-notification',
        type: 'welcome',
        title: 'Chào mừng đến với Diabetes Predictor',
        description: 'Cảm ơn bạn đã đăng ký! Hãy bắt đầu với bài đánh giá đầu tiên.',
        createdAt: new Date().toISOString(),
        isRead: false,
        deepLink: { pathname: '/prediction', query: {} },
        link: '/prediction'
      };
      console.log('[NotificationStore] Showing welcome notification (no real notifications)');
      return [welcomeNotification];
    }
    
    if (activeFilter === 'all') {
      return notifications;
    }
    
    const filtered = notifications.filter(n => n.type === activeFilter);
    console.log('[NotificationStore] Filtered result:', filtered.length, 'notifications');
    return filtered;
  },

  // Drawer controls
  openDrawer: () => {
    console.log('[NotificationStore] Opening drawer');
    const currentState = get();
    console.log('[NotificationStore] Current notifications:', currentState.notifications.length);
    set({ isDrawerOpen: true });
    console.log('[NotificationStore] isDrawerOpen set to true');
    // Do NOT auto mark all as read when opening drawer - let user control this
  },

  closeDrawer: () => {
    console.log('[NotificationStore] Closing drawer');
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
