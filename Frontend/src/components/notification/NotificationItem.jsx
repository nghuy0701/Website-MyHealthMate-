import { 
  Bell, 
  MessageSquare, 
  Activity, 
  AlertTriangle, 
  FileText,
  Lightbulb,
  X 
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/timeFormatter';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../lib/useNotificationStore';

const NOTIFICATION_ICONS = {
  chat: MessageSquare,
  prediction: Activity,
  alert: AlertTriangle,
  article: FileText,
  reminder: Lightbulb
};

const NOTIFICATION_COLORS = {
  chat: 'text-blue-600 bg-blue-50',
  prediction: 'text-purple-600 bg-purple-50',
  alert: 'text-red-600 bg-red-50',
  article: 'text-green-600 bg-green-50',
  reminder: 'text-yellow-600 bg-yellow-50'
};

export function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const navigate = useNavigate();
  const closeDrawer = useNotificationStore(state => state.closeDrawer);
  const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
  const colorClass = NOTIFICATION_COLORS[notification.type] || 'text-gray-600 bg-gray-50';

  const handleClick = () => {
    // Mark as read
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Close drawer
    closeDrawer();

    // Navigate using deep link
    if (notification.deepLink) {
      const { pathname, query } = notification.deepLink;
      
      if (query && Object.keys(query).length > 0) {
        // Build query string
        const queryString = new URLSearchParams(query).toString();
        navigate(`${pathname}?${queryString}`);
      } else {
        navigate(pathname);
      }
    } else {
      // Fallback navigation based on type
      if (notification.type === 'chat') {
        navigate('/chat');
      } else if (notification.type === 'prediction' && notification.meta?.predictionId) {
        navigate(`/prediction/${notification.meta.predictionId}`);
      } else if (notification.type === 'article' && notification.meta?.articleId) {
        navigate(`/article/${notification.meta.articleId}`);
      }
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-green-50/30' : ''
      }`}
    >
      {/* Icon */}
      <div className={`${colorClass} p-2 rounded-full flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-gray-800 text-sm">{notification.title}</h4>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-1 line-clamp-2">{notification.description}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {formatRelativeTime(notification.createdAt)}
          </span>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}
