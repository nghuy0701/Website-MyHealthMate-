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

  // Map user fields for compatibility
  const userId = user?.userId || user?._id;
  const userRole = user?.role === 'member' ? 'patient' : user?.role;

  console.log('[NotificationInitializer] Component rendered, userId:', userId, 'role:', userRole);

  useEffect(() => {
    console.log('[NotificationInitializer] useEffect triggered, user:', user);
    
    if (user && userId && userRole) {
      console.log('[NotificationInitializer] ✅ User authenticated - starting initialization');
      console.log('[NotificationInitializer] User ID:', userId, 'Role:', userRole);
      
      // Initialize socket first
      console.log('[NotificationInitializer] Step 1: Initializing socket...');
      initSocket(userId);
      
      // Then fetch notifications from API
      const fetchData = async () => {
        try {
          console.log('[NotificationInitializer] Step 2: Fetching notifications for role:', userRole);
          await loadNotifications(userRole);
          console.log('[NotificationInitializer] ✅ Notifications loaded successfully');
          
          console.log('[NotificationInitializer] Step 3: Loading unread count...');
          await loadUnreadCount();
          console.log('[NotificationInitializer] ✅ Unread count loaded successfully');
        } catch (err) {
          console.error('[NotificationInitializer] ❌ Error loading notification data:', err);
        }
      };
      
      fetchData();
    } else if (user === null) {
      // User logged out - cleanup
      console.log('[NotificationInitializer] User logged out, cleaning up');
      disconnectSocket();
      clearAll();
    } else {
      console.log('[NotificationInitializer] ⏳ Waiting for user data... userId:', userId, 'role:', userRole);
    }
  }, [userId, userRole, initSocket, disconnectSocket, loadNotifications, loadUnreadCount, clearAll]);

  return null; // This component doesn't render anything
}
