import { Link } from 'react-router-dom';
import { Heart, Mail, Github, Facebook } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-gray-800 mb-4">Về ứng dụng</h3>
            <p className="text-gray-600 mb-3">
              Diabetes Predictor – Ứng dụng đánh giá nguy cơ tiểu đường bằng trắc nghiệm thông minh.
            </p>
            <p className="text-red-600 text-sm">⚠️ Không thay thế chẩn đoán y khoa.</p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="text-gray-800 mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-green-600 transition-colors">
                  Trang chủ (Kiến thức)
                </Link>
              </li>
              <li>
                <Link to="/prediction" className="text-gray-600 hover:text-green-600 transition-colors">
                  Dự đoán
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-gray-600 hover:text-green-600 transition-colors">
                  Lịch sử
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-green-600 transition-colors">
                  Hồ sơ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-gray-800 mb-4">Pháp lý</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div>
            <h3 className="text-gray-800 mb-4">Liên hệ</h3>
            <div className="space-y-3 mb-4">
              <a href="mailto:support@diabetes-predictor.com" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@diabetes-predictor.com</span>
              </a>
              <div className="flex gap-3">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 text-sm">Nhận tin mới</p>
              <div className="flex gap-2">
                <Input placeholder="Email của bạn" className="text-sm" />
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Gửi
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600 text-sm">
          <p>
            © 2025 Diabetes Predictor — v1.0.0
          </p>
          <p className="flex items-center justify-center gap-1 mt-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for Education
          </p>
        </div>
      </div>
    </footer>
  );
}
