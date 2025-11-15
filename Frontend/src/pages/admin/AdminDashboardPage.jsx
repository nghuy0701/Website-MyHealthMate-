import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../lib/admin-context';
import api from '../../lib/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Users,
  Activity,
  TrendingUp,
  FileText,
  LogOut,
  Shield,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminDashboardPage() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPredictions: 0,
    totalPatients: 0,
    recentPredictions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [admin, navigate]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch users
      const usersResponse = await api.get('/users');
      const totalUsers = usersResponse.data.data?.length || 0;

      // Fetch predictions
      const predictionsResponse = await api.get('/predictions');
      const predictions = predictionsResponse.data.data || [];
      const totalPredictions = predictions.length;

      // Fetch patients
      const patientsResponse = await api.get('/patients');
      const totalPatients = patientsResponse.data.data?.length || 0;

      // Get recent predictions (last 10)
      const recentPredictions = predictions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      setStats({
        totalUsers,
        totalPredictions,
        totalPatients,
        recentPredictions
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Không thể tải thống kê');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const getRiskColor = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high' || level === 'cao') return 'text-red-600 bg-red-100';
    if (level === 'medium' || level === 'trung bình') return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getRiskLabel = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high') return 'Cao';
    if (level === 'medium') return 'Trung bình';
    if (level === 'low') return 'Thấp';
    return riskLevel;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">MyHealthMate Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{admin?.displayName || admin?.adminName}</p>
                <p className="text-xs text-gray-600">{admin?.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Tổng người dùng</p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {isLoading ? '...' : stats.totalUsers}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Tổng dự đoán</p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {isLoading ? '...' : stats.totalPredictions}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Tổng bệnh nhân</p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {isLoading ? '...' : stats.totalPatients}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Predictions */}
        <Card className="p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Dự đoán gần đây
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/predictions')}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Xem tất cả
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : stats.recentPredictions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có dự đoán nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Người dùng</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Mức nguy cơ</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Xác suất</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Model</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPredictions.map((prediction) => (
                    <tr key={prediction._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-800">
                          {prediction.userId?.displayName || prediction.userId?.userName || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(prediction.riskLevel)}`}>
                          {getRiskLabel(prediction.riskLevel)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-lg font-semibold text-gray-800">
                          {prediction.probability?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {prediction.modelUsed || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(prediction.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/users')}
            className="h-20 border-2 hover:bg-blue-50 hover:border-blue-600"
          >
            <Users className="w-5 h-5 mr-2" />
            Quản lý Users
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/predictions')}
            className="h-20 border-2 hover:bg-green-50 hover:border-green-600"
          >
            <Activity className="w-5 h-5 mr-2" />
            Quản lý Predictions
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/patients')}
            className="h-20 border-2 hover:bg-purple-50 hover:border-purple-600"
          >
            <FileText className="w-5 h-5 mr-2" />
            Quản lý Patients
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/admins')}
            className="h-20 border-2 hover:bg-orange-50 hover:border-orange-600"
          >
            <Shield className="w-5 h-5 mr-2" />
            Quản lý Admins
          </Button>
        </div>
      </div>
    </div>
  );
}
