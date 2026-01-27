import { X, Check, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NotificationItem } from './NotificationItem';
import { useNotificationStore } from '../../lib/useNotificationStore';
import { useAuth } from '../../lib/auth-context';

// Các tab filter thông báo
const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'prediction', label: 'Dự đoán' },
  { id: 'reminder', label: 'Nhắc nhở' },
  { id: 'alert', label: 'Cảnh báo' }
];

/**
 * Component Panel thông báo - Slide in từ bên phải
 * - Hiển thị danh sách thông báo
 * - Cho phép lọc theo loại (prediction, alert, reminder, chat)
 * - Tìm kiếm thông báo
 * - Đánh dấu đã đọc / Xóa thông báo
 */
export function NotificationDrawer() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Lấy state và actions từ store
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

  // Chuyển đổi role: member -> patient
  const userRole = user?.role === 'member' ? 'patient' : user?.role;

  // Khóa scroll của body khi drawer mở
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Đóng drawer khi nhấn phím Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen, closeDrawer]);

  // Load thông báo mới nhất khi mở drawer
  useEffect(() => {
    if (isDrawerOpen && userRole) {
      loadNotifications(userRole);
    }
  }, [isDrawerOpen, userRole, loadNotifications]);

  // Lấy danh sách thông báo đã lọc theo tab
  const filteredNotifications = getFilteredNotifications();

  // Áp dụng thêm filter tìm kiếm
  const displayNotifications = searchQuery.trim()
    ? filteredNotifications.filter(n => {
      const query = searchQuery.toLowerCase();
      return n.title?.toLowerCase().includes(query) ||
        n.description?.toLowerCase().includes(query);
    })
    : filteredNotifications;

  // Kiểm tra có thông báo chưa đọc không
  const hasUnread = notifications.some(n => !n.isRead);

  // Render portal vào document.body để đảm bảo hiển thị đúng
  return createPortal(
    <>
      {/* Backdrop - Lớp phủ tối phía sau */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 9998,
          opacity: isDrawerOpen ? 1 : 0,
          pointerEvents: isDrawerOpen ? 'auto' : 'none',
          transition: 'opacity 300ms'
        }}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel thông báo - Slide từ phải sang */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'white',
          zIndex: 9999,
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease-in-out',
          boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1), -2px 0 4px -1px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
      >
        {/* Header - Cố định ở trên */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          {/* Tiêu đề và nút đóng */}
          <div className="flex items-center justify-between px-4 py-4">
            <h2 id="notification-title" className="text-xl font-semibold text-gray-800">
              Thông báo
            </h2>
            <button
              onClick={closeDrawer}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Đóng thông báo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nút đánh dấu tất cả đã đọc - Chỉ hiện khi có thông báo chưa đọc */}
          {hasUnread && (
            <div className="px-4 pb-3">
              <button
                onClick={() => {
                  markAllAsRead();
                }}
                className="w-full py-2.5 px-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}

          {/* Ô tìm kiếm */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm thông báo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tabs lọc - Sticky dưới header */}
        <div className="flex-shrink-0 sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex overflow-x-auto scrollbar-hide">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeFilter === tab.id
                  ? 'text-green-600 border-green-600'
                  : 'text-gray-600 border-transparent hover:text-green-600'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách thông báo - Có thể scroll */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {isLoading ? (
            // Loading spinner
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : displayNotifications.length === 0 ? (
            // Empty state
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
            // Danh sách thông báo
            <div className="divide-y divide-gray-100">
              {displayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
