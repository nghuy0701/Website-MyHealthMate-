// ============================================
// IMPORT CÁC ICON VÀ COMPONENTS
// ============================================
import {
  Bell,           // Icon chuông (mặc định)
  MessageSquare,  // Icon tin nhắn (cho chat)
  Activity,       // Icon hoạt động (cho prediction)
  AlertTriangle,  // Icon cảnh báo (cho alert)
  FileText,       // Icon tài liệu (cho article)
  Lightbulb,      // Icon bóng đèn (cho reminder)
  X,              // Icon X (nút xóa)
  Sparkles        // Icon ngôi sao (cho welcome)
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/timeFormatter'; // Format thời gian tương đối
import { useNavigate } from 'react-router-dom'; // Hook điều hướng
import { useNotificationStore } from '../../lib/useNotificationStore'; // Store quản lý thông báo

// ============================================
// CONFIGURATION - CẤU HÌNH ICON VÀ MÀU SẮC
// ============================================

/**
 * NOTIFICATION_ICONS - Mapping từ type sang icon component
 * 
 * Mỗi loại thông báo có icon riêng để dễ nhận biết:
 * - chat: MessageSquare (tin nhắn mới)
 * - prediction: Activity (kết quả dự đoán)
 * - alert: AlertTriangle (cảnh báo khẩn cấp)
 * - article: FileText (bài viết mới)
 * - reminder: Lightbulb (nhắc nhở)
 * - welcome: Sparkles (chào mừng)
 */
const NOTIFICATION_ICONS = {
  chat: MessageSquare,
  prediction: Activity,
  alert: AlertTriangle,
  article: FileText,
  reminder: Lightbulb,
  welcome: Sparkles
};

/**
 * NOTIFICATION_COLORS - Mapping từ type sang class màu sắc
 * 
 * Mỗi loại thông báo có màu riêng (text + background):
 * - chat: Tím (purple) - Tin nhắn
 * - prediction: Xanh lá (green) - Dự đoán
 * - alert: Cam (orange) - Cảnh báo
 * - article: Xanh dương (blue) - Bài viết
 * - reminder: Xanh nhạt (blue) - Nhắc nhở
 * - welcome: Xám (gray) - Chào mừng
 * 
 * Format: 'text-{color}-600 bg-{color}-50'
 * - text-{color}-600: Màu chữ/icon đậm
 * - bg-{color}-50: Màu nền nhạt
 */
const NOTIFICATION_COLORS = {
  chat: 'text-purple-600 bg-purple-50',
  prediction: 'text-green-600 bg-green-50',
  alert: 'text-orange-600 bg-orange-50',
  article: 'text-blue-600 bg-blue-50',
  reminder: 'text-blue-500 bg-blue-50',
  welcome: 'text-gray-600 bg-gray-50'
};

// ============================================
// NOTIFICATION ITEM COMPONENT
// ============================================

/**
 * NotificationItem - Component hiển thị một thông báo
 * 
 * @param {Object} props
 * @param {Object} props.notification - Dữ liệu thông báo
 *   - id: ID thông báo
 *   - type: Loại (chat/prediction/alert/article/reminder/welcome)
 *   - title: Tiêu đề
 *   - description: Nội dung
 *   - isRead: Đã đọc chưa
 *   - createdAt: Thời gian tạo
 *   - deepLink: Thông tin điều hướng
 *   - meta: Metadata bổ sung
 * @param {Function} props.onMarkAsRead - Callback đánh dấu đã đọc
 * @param {Function} props.onDelete - Callback xóa thông báo
 * 
 * Tính năng:
 * - Hiển thị icon và màu sắc theo loại thông báo
 * - Click vào thông báo để điều hướng đến trang liên quan
 * - Tự động đánh dấu đã đọc khi click
 * - Nút xóa thông báo
 * - Hiển thị badge chưa đọc (chấm xanh)
 * - Hiển thị thời gian tương đối (ví dụ: "2 phút trước")
 */
export function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const navigate = useNavigate(); // Hook để điều hướng trang
  const closeDrawer = useNotificationStore(state => state.closeDrawer); // Lấy hàm đóng drawer từ store

  // Lấy icon tương ứng với type, nếu không có thì dùng Bell (chuông)
  const Icon = NOTIFICATION_ICONS[notification.type] || Bell;

  // Lấy class màu sắc tương ứng với type, nếu không có thì dùng màu xám
  const colorClass = NOTIFICATION_COLORS[notification.type] || 'text-gray-600 bg-gray-50';

  /**
   * handleClick - Xử lý khi click vào thông báo
   * 
   * Flow:
   * 1. Đánh dấu thông báo là đã đọc (nếu chưa đọc)
   * 2. Đóng panel thông báo
   * 3. Điều hướng đến trang liên quan
   * 
   * Điều hướng theo thứ tự ưu tiên:
   * 1. deepLink (pathname + query) - Ưu tiên cao nhất
   * 2. link - Đường dẫn đơn giản
   * 3. Fallback theo type:
   *    - chat -> /chat
   *    - prediction -> /prediction/:predictionId
   *    - article -> /article/:articleId
   */
  const handleClick = async () => {
    // Bước 1: Đánh dấu đã đọc (trừ welcome notification vì nó không có trong database)
    if (notification.type !== 'welcome' && !notification.isRead) {
      await onMarkAsRead(notification.id);
    }

    // Bước 2: Đóng panel thông báo
    closeDrawer();

    // Bước 3: Điều hướng
    // Option 1: Sử dụng deepLink (có pathname và query)
    if (notification.deepLink) {
      const { pathname, query } = notification.deepLink;

      // Nếu có query params, thêm vào URL
      if (query && Object.keys(query).length > 0) {
        const queryString = new URLSearchParams(query).toString();
        navigate(`${pathname}?${queryString}`);
      } else {
        // Không có query, chỉ có pathname
        navigate(pathname);
      }
    }
    // Option 2: Sử dụng link đơn giản
    else if (notification.link) {
      navigate(notification.link);
    }
    // Option 3: Fallback - Điều hướng dựa trên type
    else {
      if (notification.type === 'chat') {
        navigate('/chat');
      } else if (notification.type === 'prediction' && notification.meta?.predictionId) {
        navigate(`/prediction/${notification.meta.predictionId}`);
      } else if (notification.type === 'article' && notification.meta?.articleId) {
        navigate(`/article/${notification.meta.articleId}`);
      }
    }
  };

  /**
   * handleDelete - Xử lý khi click nút xóa
   * 
   * @param {Event} e - Click event
   * 
   * Lưu ý:
   * - stopPropagation() để ngăn event bubbling (không trigger handleClick)
   * - Gọi callback onDelete để xóa thông báo
   */
  const handleDelete = (e) => {
    e.stopPropagation(); // Ngăn event bubbling lên thẻ cha
    onDelete(notification.id); // Gọi hàm xóa
  };

  // ============================================
  // RENDER UI
  // ============================================

  /**
   * Cấu trúc UI:
   * - Container: Clickable, hover effect, background khác nếu chưa đọc
   * - Icon: Hiển thị icon theo type với màu tương ứng
   * - Content:
   *   + Title: Tiêu đề thông báo
   *   + Delete button: Nút xóa
   *   + Description: Nội dung (giới hạn 2 dòng)
   *   + Footer: Thời gian + badge chưa đọc
   */
  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-green-50/30' : '' // Nền xanh nhạt nếu chưa đọc
        }`}
    >
      {/* Icon - Hiển thị icon theo type với màu tương ứng */}
      <div className={`${colorClass} p-2 rounded-full flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content - Nội dung thông báo */}
      <div className="flex-1 min-w-0">
        {/* Header: Title + Delete button */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-gray-800 text-sm">{notification.title}</h4>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description - Giới hạn 2 dòng (line-clamp-2) */}
        <p className="text-sm text-gray-600 mb-1 line-clamp-2">{notification.description}</p>

        {/* Footer: Thời gian + Badge chưa đọc */}
        <div className="flex items-center gap-2">
          {/* Thời gian tương đối (ví dụ: "2 phút trước") */}
          <span className="text-xs text-gray-500">
            {formatRelativeTime(notification.createdAt)}
          </span>

          {/* Badge chưa đọc - Chấm xanh nhỏ */}
          {!notification.isRead && (
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}
