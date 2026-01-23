import { BarChart3, Users, FileText, HelpCircle, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

export function Sidebar({ activePage, onPageChange, adminProfile }) {
  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Thống kê & Báo cáo' },
    { id: 'users', icon: Users, label: 'Quản lý Người dùng' },
    { id: 'articles', icon: FileText, label: 'Quản lý Bài viết' },
    { id: 'questions', icon: HelpCircle, label: 'Quản lý Bộ Câu hỏi' },
    { id: 'chat', icon: MessageSquare, label: 'Tư vấn Bệnh nhân' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div
        className="p-6 cursor-pointer hover:brightness-105 transition-all"
        onClick={() => onPageChange('dashboard')}
      >
        <div className="rounded-2xl p-4 text-white shadow-sm" style={{ backgroundColor: '#00A63E' }}>
          <h1 className="text-xl font-semibold">🩺 Diabetes Predictor</h1>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <>
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${isActive
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
              {item.id === 'chat' && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Avatar className="w-10 h-10 border-2 border-green-200">
                      <AvatarImage src={adminProfile.avatarUrl} />
                      <AvatarFallback>{adminProfile.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{adminProfile.fullName}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-2 text-gray-600 hover:text-green-600 hover:border-green-300"
                    onClick={() => onPageChange('profile')}
                  >
                    Hồ sơ
                  </Button>
                </div>
              )}
            </>
          );
        })}
      </nav>

    </div>
  );
}