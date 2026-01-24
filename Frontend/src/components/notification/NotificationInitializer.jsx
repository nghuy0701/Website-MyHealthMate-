import { useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useNotificationStore } from '../../lib/useNotificationStore';

/**
 * Component to initialize notification store when user logs in/out
 */
export function NotificationInitializer() {
  const { user } = useAuth();
  const initSocket = useNotificationStore(state => state.initSocket);
  const disconnectSocket = useNotificationStore(state => state.disconnectSocket);
  const loadNotifications = useNotificationStore(state => state.loadNotifications);
  const loadUnreadCount = useNotificationStore(state => state.loadUnreadCount);
  const clearAll = useNotificationStore(state => state.clearAll);

  useEffect(() => {
    if (user) {
      // User logged in - initialize notifications
      initSocket(user.userId);
      loadNotifications(user.role);
      loadUnreadCount();
    } else {
      // User logged out - cleanup
      disconnectSocket();
      clearAll();
    }
  }, [user, initSocket, disconnectSocket, loadNotifications, loadUnreadCount, clearAll]);

  return null; // This component doesn't render anything
}
