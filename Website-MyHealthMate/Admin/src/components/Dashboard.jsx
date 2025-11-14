import { Users, Calendar, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';

export function Dashboard() {
  const stats = [
    {
      icon: Users,
      title: 'Tổng người dùng',
      value: '1.250 người dùng',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: Calendar,
      title: 'Tổng số dự đoán',
      value: '320 lượt trong tháng này',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: AlertTriangle,
      title: 'Tỷ lệ nguy cơ TB',
      value: '34% - Mức trung bình',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <div>
      <h1 className="mb-8 text-gray-800">Thống kê & Báo cáo</h1>
      
      <div className="grid grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className={`${stat.bgColor} border-0 rounded-[20px] p-6 shadow-sm hover:-translate-y-0.5 transition-transform cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                <div className={`${stat.iconColor} p-3 bg-white rounded-xl shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className={`${stat.iconColor}`}>{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
