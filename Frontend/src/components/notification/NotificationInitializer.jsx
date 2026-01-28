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
 */
export function NotificationInitializer() {
  const { user } = useAuth();
  const initSocket = useNotificationStore(state => state.initSocket);
  const disconnectSocket = useNotificationStore(state => state.disconnectSocket);
  const loadNotifications = useNotificationStore(state => state.loadNotifications);
  const loadUnreadCount = useNotificationStore(state => state.loadUnreadCount);
  const clearAll = useNotificationStore(state => state.clearAll);

  // Lấy userId và role từ user object
  const userId = user?.userId || user?._id;
  const userRole = user?.role === 'member' ? 'patient' : user?.role;

  useEffect(() => {
    if (user && userId && userRole) {
      // User đã login - Khởi tạo hệ thống thông báo
      console.log('[Notification] ✅ User logged in - Initializing notification system');

      // Bước 1: Kết nối Socket.IO
      initSocket(userId);

      // Bước 2: Load danh sách thông báo và unread count
      const fetchData = async () => {
        try {
          await loadNotifications(userRole);
          await loadUnreadCount();
          console.log('[Notification] ✅ Notification system initialized');
        } catch (err) {
          console.error('[Notification] ❌ Error initializing:', err);
        }
      };

      fetchData();
    } else if (user === null) {
      // User đã logout - Dọn dẹp
      console.log('[Notification] 🔌 User logged out - Cleaning up');
      disconnectSocket();
      clearAll();
    }
  }, [userId, userRole, initSocket, disconnectSocket, loadNotifications, loadUnreadCount, clearAll]);

  return null; // Component này không render gì
}
