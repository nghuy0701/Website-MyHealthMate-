import { X, Check, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NotificationItem } from './NotificationItem';
import { useNotificationStore } from '../../lib/useNotificationStore';
import { useAuth } from '../../lib/auth-context';

const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'prediction', label: 'Dự đoán' },
  { id: 'reminder', label: 'Nhắc nhở' },
  { id: 'alert', label: 'Cảnh báo' },
  { id: 'article', label: 'Bài viết' }
];

export function NotificationDrawer() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const isDrawerOpen = useNotificationStore(state => state.isDrawerOpen);
  const isLoading = useNotificationStore(state => state.isLoading);
  const activeFilter = useNotificationStore(state => state.activeFilter);
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const notifications = useNotificationStore(state => state.notifications);
  const closeDrawer = useNotificationStore(state => state.closeDrawer);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const deleteNotification = useNotificationStore(state => state.deleteNotification);
  const setActiveFilter = useNotificationStore(state => state.setActiveFilter);
  const loadNotifications = useNotificationStore(state => state.loadNotifications);
  const getFilteredNotifications = useNotificationStore(state => state.getFilteredNotifications);

  // Map role: member -> patient
  const userRole = user?.role === 'member' ? 'patient' : user?.role;

  console.log('[NotificationDrawer] Component state:', { isDrawerOpen, userRole, notificationCount: notifications.length });

  // Fetch latest notifications when drawer opens
  useEffect(() => {
    console.log('[NotificationDrawer] useEffect running - isDrawerOpen:', isDrawerOpen, 'userRole:', userRole);
    if (isDrawerOpen && userRole) {
      console.log('[NotificationDrawer] Drawer opened, fetching latest notifications for role:', userRole);
      loadNotifications(userRole);
    }
  }, [isDrawerOpen, userRole, loadNotifications]);

  // Get filtered notifications from store (filtering done in store)
  const filteredNotifications = getFilteredNotifications();
  
  // Apply search filter on top of type filter
  const displayNotifications = searchQuery.trim()
    ? filteredNotifications.filter(n => {
        const query = searchQuery.toLowerCase();
        return n.title?.toLowerCase().includes(query) || 
               n.description?.toLowerCase().includes(query);
      })
    : filteredNotifications;
  
  const hasUnread = notifications.some(n => !n.isRead);

  console.log('[NotificationDrawer] Render state:', {
    isDrawerOpen,
    totalNotifications: notifications.length,
    filteredCount: filteredNotifications.length,
    displayCount: displayNotifications.length,
    activeFilter,
    searchQuery,
    unreadCount,
    isLoading,
    displayNotificationsSample: displayNotifications[0]
  });

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black transition-opacity"
        style={{ 
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          opacity: isDrawerOpen ? 1 : 0,
          pointerEvents: isDrawerOpen ? 'auto' : 'none'
        }}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div 
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300"
        style={{ 
          zIndex: 9999,
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800">Thông báo</h2>
            <button
              onClick={closeDrawer}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Mark all as read button */}
          {hasUnread && (
            <div className="px-4 pb-3">
              <button
                onClick={() => {
                  markAllAsRead();
                }}
                className="w-full py-2 px-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}
          
          {/* Search box */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm thông báo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 px-4">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeFilter === tab.id
                  ? 'text-green-600 border-green-600'
                  : 'text-gray-600 border-transparent hover:text-green-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <div className="text-5xl mb-4">🔔</div>
              <p className="text-center text-sm">
                {searchQuery.trim() ? (
                  `Không tìm thấy kết quả cho "${searchQuery}"`
                ) : activeFilter === 'all' ? (
                  'Chưa có thông báo nào'
                ) : (
                  `Chưa có thông báo ${FILTER_TABS.find(t => t.id === activeFilter)?.label.toLowerCase()}`
                )}
              </p>
            </div>
          ) : (
            displayNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
