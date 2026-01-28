import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../lib/useNotificationStore';

/**
 * NotificationBell - Component hiển thị icon chuông thông báo
 * 
 * Tính năng:
 * - Hiển thị icon chuông
 * - Hiển thị badge số thông báo chưa đọc
 * - Click để mở notification drawer
 * 
 * Sử dụng cho:
 * - User page (Header.jsx)
 * - Doctor page (AdminChatPage.jsx)
 */
export function NotificationBell() {
    const unreadCount = useNotificationStore(state => state.unreadCount);
    const openDrawer = useNotificationStore(state => state.openDrawer);

    return (
        <button
            onClick={() => {
                console.log('[NotificationBell] Opening drawer');
                openDrawer();
            }}
            className="relative text-gray-600 hover:text-green-600 transition-colors"
            aria-label="Thông báo"
        >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
                <span
                    className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        borderRadius: '9999px',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}
                >
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
}
