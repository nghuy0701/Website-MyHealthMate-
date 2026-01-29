import { create } from 'zustand';
import { io } from 'socket.io-client';
import { notificationAPI } from './api';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8017';

const normalizeId = (value) => {
  if (value === null || value === undefined) return undefined;
  return value?.toString ? value.toString() : value;
};

const normalizeNotification = (notification) => {
  if (!notification || typeof notification !== 'object') return null;

  return {
    ...notification,
    id: normalizeId(
      notification.id ??
      notification._id ??
      notification.notificationId ??
      notification.messageId
    ),
    createdAt: notification.createdAt ?? notification.created_at ?? notification.timestamp,
    isRead: notification.isRead ?? notification.read ?? notification.is_read ?? false
  };
};

const buildChatNotificationFromMessage = (data) => {
  if (!data || typeof data !== 'object') return null;

  const conversationId = normalizeId(data.conversationId);
  const messageId = normalizeId(data.messageId ?? data.id);
  const hasAttachments = Array.isArray(data.attachments) && data.attachments.length > 0;
  const description = data.content || (hasAttachments ? '[Attachment]' : 'You have a new message');

  return normalizeNotification({
    id: messageId ? `msg:${messageId}` : undefined,
    type: 'chat',
    title: data.senderName ? `New message from ${data.senderName}` : 'New message',
    description,
    isRead: false,
    createdAt: data.createdAt,
    meta: {
      ...(data.meta || {}),
      conversationId,
      messageId
    },
    link: '/chat'
  });
};

/**
 * Zustand Store quản lý hệ thống thông báo
 * - Kết nối Socket.IO để nhận thông báo realtime
 * - Quản lý danh sách thông báo và số lượng chưa đọc
 * - Xử lý các thao tác: đọc, xóa, lọc thông báo
 */
export const useNotificationStore = create((set, get) => ({
  // ============ STATE ============
  notifications: [],              // Danh sách tất cả thông báo
  unreadCount: 0,                 // Số lượng thông báo chưa đọc
  isLoading: false,               // Trạng thái đang tải
  isDrawerOpen: false,            // Trạng thái mở/đóng panel thông báo
  activeFilter: 'all',            // Bộ lọc hiện tại: 'all', 'prediction', 'alert', 'reminder', 'chat'
  socket: null,                   // Socket.IO instance
  currentConversationId: null,    // ID cuộc trò chuyện hiện tại (để ẩn notification chat)

  // ============ SOCKET.IO ============
  /**
   * Khởi tạo kết nối Socket.IO
   * @param {string} userId - ID của user hiện tại
   */
  initSocket: (userId) => {
    if (!userId) {
      return;
    }

    const existingSocket = get().socket;
    if (existingSocket?.connected) {
      return; // Socket đã kết nối rồi
    }

    const currentUserId = normalizeId(userId);
    const socket = io(SOCKET_URL, {
      auth: {
        userId: userId  // Backend requires this for authentication
      },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Khi kết nối thành công
    socket.on('connect', () => {
      console.log('[Socket][Notification] Connected:', socket.id);
    });



    // Khi nhận thông báo mới từ server
    socket.on('notification:new', (payload) => {
      const notification = normalizeNotification(payload?.notification ?? payload);
      if (!notification) {
        return;
      }

      // Kh??ng hi????n th??? th??ng b??o chat n???u user ??ang ??? trong cu???c tr?? chuy???n ????
      const currentConversationId = normalizeId(get().currentConversationId);
      const notificationConversationId = normalizeId(notification.meta?.conversationId);

      if (notification.type === 'chat' &&
        notificationConversationId && notificationConversationId === currentConversationId) {
        return; // B??? qua th??ng b??o n??y
      }

      get().addNotification(notification);
    });

    socket.on('message:new', (data) => {
      if (!data) return;

      const senderId = normalizeId(data.senderId);
      if (senderId && currentUserId && senderId === currentUserId) {
        return;
      }

      const currentConversationId = normalizeId(get().currentConversationId);
      const conversationId = normalizeId(data.conversationId);
      if (conversationId && currentConversationId && conversationId === currentConversationId) {
        return;
      }

      const notification = buildChatNotificationFromMessage(data);
      if (notification) {
        get().addNotification(notification);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket][Notification] Disconnected');
    });

    set({ socket });
  },

  /**
   * Ngắt kết nối Socket.IO
   */
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  // ============ LOAD DATA ============
  /**
   * Tải danh sách thông báo từ API
   * @param {string} userRole - Role của user ('patient' hoặc 'doctor')
   */
  loadNotifications: async (userRole) => {
    if (!userRole) {
      return;
    }

    try {
      set({ isLoading: true });

      const response = await notificationAPI.getMyNotifications();
      const notifications = (response.data || [])
        .map(normalizeNotification)
        .filter(Boolean);

      // Backend đã filter theo role rồi, dùng trực tiếp
      set({
        notifications: notifications,
        unreadCount: notifications.filter(n => !n.isRead).length
      });

    } catch (error) {
      console.error('[Notification] ❌ Lỗi tải thông báo:', error);
      set({ notifications: [], unreadCount: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Tải số lượng thông báo chưa đọc
   */
  loadUnreadCount: async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      const count = response.data?.count || 0;
      set({ unreadCount: count });
    } catch (error) {
      console.error('[Notification] ❌ Lỗi tải unread count:', error);
    }
  },

  // ============ THÊM THÔNG BÁO MỚI (REALTIME) ============
  /**
   * Thêm thông báo mới vào danh sách (được gọi khi nhận từ Socket.IO)
   * @param {Object} notification - Thông báo mới
   */
  addNotification: (notification) => {
    const normalized = normalizeNotification(notification);
    if (!normalized) return;

    set((state) => {
      if (normalized.id && state.notifications.some(n => n.id === normalized.id)) {
        return state;
      }

      const isUnread = normalized.isRead === false;
      return {
        notifications: [normalized, ...state.notifications],
        unreadCount: state.unreadCount + (isUnread ? 1 : 0)
      };
    });

    // Hi???n th??? browser notification n???u ???????c ph??p
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(normalized.title, {
        body: normalized.description,
        icon: '/logo.png'
      });
    }
  },

  // ============ ĐÁNH DẤU ĐÃ ĐỌC ============
  /**
   * Đánh dấu 1 thông báo là đã đọc
   * @param {string} notificationId - ID của thông báo
   */
  markAsRead: async (notificationId) => {
    try {
      // Cập nhật UI ngay lập tức (optimistic update)
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

      // Gọi API ở background
      await notificationAPI.markAsRead(notificationId);
    } catch (error) {
      console.error('[Notification] ❌ Lỗi đánh dấu đã đọc:', error);
      // Nếu lỗi, reload lại để đồng bộ với server
      get().loadNotifications();
    }
  },

  /**
   * Đánh dấu TẤT CẢ thông báo là đã đọc
   */
  markAllAsRead: async () => {
    try {
      // Cập nhật UI ngay
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));

      // Gọi API
      await notificationAPI.markAllAsRead();
    } catch (error) {
      console.error('[Notification] ❌ Lỗi đánh dấu tất cả đã đọc:', error);
      get().loadNotifications();
    }
  },

  // ============ XÓA THÔNG BÁO ============
  /**
   * Xóa 1 thông báo
   * @param {string} notificationId - ID của thông báo
   */
  deleteNotification: async (notificationId) => {
    try {
      // Cập nhật UI ngay
      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.isRead;

        return {
          notifications: state.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });

      // Gọi API
      await notificationAPI.deleteNotification(notificationId);
    } catch (error) {
      console.error('[Notification] ❌ Lỗi xóa thông báo:', error);
      get().loadNotifications();
    }
  },

  // ============ MỞ/ĐÓNG PANEL ============
  /**
   * Mở panel thông báo
   */
  openDrawer: () => {
    set({ isDrawerOpen: true });

    const { unreadCount } = get();
    if (unreadCount > 0) {
      get().markAllAsRead();
    }
  },

  /**
   * Đóng panel thông báo
   */
  closeDrawer: () => {
    set({ isDrawerOpen: false });
  },

  // ============ LỌC THÔNG BÁO ============
  /**
   * Đặt bộ lọc hiện tại
   * @param {string} filter - Loại filter: 'all', 'prediction', 'alert', 'reminder', 'chat'
   */
  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
  },

  /**
   * Lấy danh sách thông báo đã được lọc theo activeFilter
   * @returns {Array} Danh sách thông báo đã lọc
   */
  getFilteredNotifications: () => {
    const { notifications, activeFilter } = get();

    if (activeFilter === 'all') {
      return notifications; // Trả về tất cả
    }

    // Lọc theo type
    return notifications.filter(n => n.type === activeFilter);
  },

  // ============ QUẢN LÝ CONVERSATION ============
  /**
   * Set ID cuộc trò chuyện hiện tại (để ẩn notification chat của conversation đó)
   * @param {string} conversationId - ID của conversation
   */
  setCurrentConversationId: (conversationId) => {
    set({ currentConversationId: conversationId });
  },

  // ============ LOGOUT ============
  /**
   * Xóa toàn bộ state khi user logout
   */
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
