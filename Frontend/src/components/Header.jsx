import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { useNotificationStore } from '../lib/useNotificationStore';
import { Button } from './ui/button';
import { Leaf, Bell } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const openDrawer = useNotificationStore(state => state.openDrawer);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-800">Diabetes Predictor</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`transition-colors ${isActive('/') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                }`}
            >
              Kiến thức
            </Link>

            {user ? (
              <>
                <Link
                  to="/prediction"
                  className={`transition-colors ${isActive('/prediction') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                    }`}
                >
                  Dự đoán
                </Link>
                <Link
                  to="/history"
                  className={`transition-colors ${isActive('/history') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                    }`}
                >
                  Lịch sử
                </Link>
                <Link
                  to="/chat"
                  className={`transition-colors ${isActive('/chat') || location.pathname.startsWith('/chat/') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                    }`}
                >
                  Tư vấn
                </Link>

                <Link
                  to="/profile"
                  className={`transition-colors ${isActive('/profile') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                    }`}
                >
                  Hồ sơ
                </Link>

                {/* Notification Bell */}
                <button
                  onClick={() => {
                    console.log('Bell clicked');
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

                <Button
                  variant="outline"
                  onClick={logout}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-green-600 hover:bg-green-700">Đăng ký</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
