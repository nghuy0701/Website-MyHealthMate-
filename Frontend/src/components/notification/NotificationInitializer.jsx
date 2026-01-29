import { useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useNotificationStore } from '../../lib/useNotificationStore';

/**
 * Component khởi tạo hệ thống thông báo khi user login/logout
 * - Kết nối Socket.IO khi user login
 * - Load danh sách thông báo và unread count
 * - Ngắt kết nối và xóa state khi user logout
 * 
 * Component này không render gì cả, chỉ chạy side effects
 * UPDATED: Added debug logs for troubleshooting
 */
export function NotificationInitializer() {
  const { user } = useAuth();
  const initSocket = useNotificationStore(state => state.initSocket);
  const disconnectSocket = useNotificationStore(state => state.disconnectSocket);
  const loadNotifications = useNotificationStore(state => state.loadNotifications);
  const loadUnreadCount = useNotificationStore(state => state.loadUnreadCount);
  const clearAll = useNotificationStore(state => state.clearAll);


  // Lấy userId và role từ user object - Match logic from ChatPage.jsx
  const userId = user?._id?.toString() || user?.id?.toString() || user?.userId;
  const userRole = user?.role === 'member' ? 'patient' : user?.role;

  useEffect(() => {
    if (user && userId && userRole) {
      // Bước 1: Kết nối Socket.IO
      initSocket(userId);

      // Bước 2: Load danh sách thông báo và unread count
      const fetchData = async () => {
        try {
          await loadNotifications(userRole);
          await loadUnreadCount();
        } catch (err) {
          console.error('[Notification] ❌ Error initializing:', err);
        }
      };

      fetchData();
    } else if (user === null) {
      disconnectSocket();
      clearAll();
    }
  }, [userId, userRole, user, initSocket, disconnectSocket, loadNotifications, loadUnreadCount, clearAll]);

  return null; // Component này không render gì
}
