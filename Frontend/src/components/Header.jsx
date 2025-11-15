import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Button } from './ui/button';
import { Leaf } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
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
              className={`transition-colors ${
                isActive('/') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Kiến thức
            </Link>

            {user ? (
              <>
                <Link
                  to="/prediction"
                  className={`transition-colors ${
                    isActive('/prediction') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Dự đoán
                </Link>
                <Link
                  to="/history"
                  className={`transition-colors ${
                    isActive('/history') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Lịch sử
                </Link>
                <Link
                  to="/profile"
                  className={`transition-colors ${
                    isActive('/profile') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Hồ sơ
                </Link>
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
