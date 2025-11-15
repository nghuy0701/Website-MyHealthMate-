import { useState, useEffect } from 'react';
import { Users, Calendar, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPredictions: 0,
    averageRisk: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
    predictions: [],
  });
  const [loading, setLoading] = useState(true);
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await fetch(`${API_BASE_URL}/users`, {
        credentials: 'include',
      });
      const usersData = await usersResponse.json();
      
      // Fetch predictions
      const predictionsResponse = await fetch(`${API_BASE_URL}/predictions`, {
        credentials: 'include',
      });
      const predictionsData = await predictionsResponse.json();
      
      // Calculate statistics
      const totalUsers = usersData.data?.length || 0;
      const totalPredictions = predictionsData.data?.length || 0;
      
      // Calculate average risk from predictions (using probability field)
      let averageRisk = 0;
      let highRiskCount = 0;
      let mediumRiskCount = 0;
      let lowRiskCount = 0;
      
      if (predictionsData.data && predictionsData.data.length > 0) {
        const totalRisk = predictionsData.data.reduce((sum, pred) => {
          return sum + (pred.probability || 0);
        }, 0);
        averageRisk = Math.round(totalRisk / predictionsData.data.length);
        
        // Count by risk level
        predictionsData.data.forEach(pred => {
          const prob = pred.probability || 0;
          if (prob >= 70) highRiskCount++;
          else if (prob >= 30) mediumRiskCount++;
          else lowRiskCount++;
        });
      }
      
      setStats({
        totalUsers,
        totalPredictions,
        averageRisk,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        predictions: predictionsData.data || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (risk) => {
    if (risk < 30) return 'Thấp';
    if (risk < 70) return 'Trung bình';
    return 'Cao';
  };

  const dashboardStats = [
    {
      icon: Users,
      title: 'Tổng người dùng',
      value: loading ? 'Đang tải...' : `${stats.totalUsers.toLocaleString()} người dùng`,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      onClick: () => navigate('/admin/users'),
    },
    {
      icon: Calendar,
      title: 'Tổng số dự đoán',
      value: loading ? 'Đang tải...' : `${stats.totalPredictions.toLocaleString()} lượt`,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      onClick: () => navigate('/admin/predictions'),
    },
    {
      icon: AlertTriangle,
      title: 'Xác suất nguy cơ TB',
      value: loading ? 'Đang tải...' : `${stats.averageRisk}% - ${getRiskLevel(stats.averageRisk)}`,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      onClick: () => setShowStatsDialog(true),
    },
  ];

  return (
    <div>
      <h1 className="mb-8 text-gray-800">Thống kê & Báo cáo</h1>
      
      <div className="grid grid-cols-3 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              onClick={stat.onClick}
              className={`${stat.bgColor} border-0 rounded-[20px] p-6 shadow-sm hover:-translate-y-0.5 transition-transform cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                <div className={`${stat.iconColor} p-3 bg-white rounded-xl shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className={`${stat.iconColor} font-semibold`}>{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Statistics Detail Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-3xl rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Thống kê chi tiết nguy cơ tiểu đường</DialogTitle>
            <DialogDescription>
              Phân tích xác suất nguy cơ và phân bố theo mức độ
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-0 p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Tổng dự đoán</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPredictions}</p>
                </div>
              </Card>
              <Card className="bg-red-50 border-0 p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Nguy cơ cao</p>
                  <p className="text-2xl font-bold text-red-600">{stats.highRiskCount}</p>
                  <p className="text-xs text-gray-500 mt-1">≥70%</p>
                </div>
              </Card>
              <Card className="bg-yellow-50 border-0 p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Trung bình</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.mediumRiskCount}</p>
                  <p className="text-xs text-gray-500 mt-1">30-70%</p>
                </div>
              </Card>
              <Card className="bg-green-50 border-0 p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Nguy cơ thấp</p>
                  <p className="text-2xl font-bold text-green-600">{stats.lowRiskCount}</p>
                  <p className="text-xs text-gray-500 mt-1">&lt;30%</p>
                </div>
              </Card>
            </div>

            {/* Risk Distribution */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Phân bố nguy cơ</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Nguy cơ cao (≥70%)</span>
                    <span className="font-semibold text-red-600">
                      {stats.totalPredictions > 0 ? Math.round((stats.highRiskCount / stats.totalPredictions) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.totalPredictions > 0 ? (stats.highRiskCount / stats.totalPredictions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Nguy cơ trung bình (30-70%)</span>
                    <span className="font-semibold text-yellow-600">
                      {stats.totalPredictions > 0 ? Math.round((stats.mediumRiskCount / stats.totalPredictions) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.totalPredictions > 0 ? (stats.mediumRiskCount / stats.totalPredictions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Nguy cơ thấp (&lt;30%)</span>
                    <span className="font-semibold text-green-600">
                      {stats.totalPredictions > 0 ? Math.round((stats.lowRiskCount / stats.totalPredictions) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.totalPredictions > 0 ? (stats.lowRiskCount / stats.totalPredictions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Risk Summary */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Xác suất nguy cơ trung bình</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.averageRisk}%</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Đánh giá: <span className="font-semibold">{getRiskLevel(stats.averageRisk)}</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => {
                  setShowStatsDialog(false);
                  navigate('/admin/predictions');
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
              >
                Xem tất cả dự đoán
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowStatsDialog(false)}
                className="rounded-xl"
              >
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
