import { X, Check } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useNotificationStore } from '../../lib/useNotificationStore';

const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'chat', label: 'Tin nhắn' },
  { id: 'prediction', label: 'Dự đoán' },
  { id: 'alert', label: 'Cảnh báo' },
  { id: 'reminder', label: 'Nhắc nhở' },
  { id: 'article', label: 'Bài viết' }
];

export function NotificationDrawer() {
  const {
    isDrawerOpen,
    isLoading,
    activeFilter,
    unreadCount,
    closeDrawer,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setActiveFilter,
    getFilteredNotifications
  } = useNotificationStore();

  const filteredNotifications = getFilteredNotifications();
  const hasUnread = filteredNotifications.some(n => !n.isRead);

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Thông báo</h2>
            {unreadCount > 0 && (
              <span className="bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasUnread && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-green-600 hover:text-green-700 transition-colors flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Đánh dấu tất cả đã đọc
              </button>
            )}
            <button
              onClick={closeDrawer}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <div className="text-5xl mb-4">🔔</div>
              <p className="text-center text-sm">
                {activeFilter === 'all' 
                  ? 'Chưa có thông báo nào'
                  : `Chưa có thông báo ${FILTER_TABS.find(t => t.id === activeFilter)?.label.toLowerCase()}`
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
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
    </>
  );
}
