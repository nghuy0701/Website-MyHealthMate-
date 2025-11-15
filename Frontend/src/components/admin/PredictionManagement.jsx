import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Calendar, User, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card } from '../ui/card';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export function PredictionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgRisk: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
  });

  // Fetch predictions from API
  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/predictions`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.data) {
        // Format predictions data
        const formattedPredictions = data.data.map((pred) => ({
          id: pred._id,
          patientName: pred.patientId?.displayName || 'Không có bệnh nhân',
          patientEmail: pred.patientId?.email || 'N/A',
          userName: pred.userId?.username || 'N/A',
          userDisplayName: pred.userId?.displayName || 'N/A',
          riskPercentage: pred.probability ? Math.round(pred.probability) : 0,
          riskLevel: pred.riskLevel || 'unknown',
          prediction: pred.prediction === 1 ? 'Có nguy cơ' : 'Không nguy cơ',
          createdAt: pred.createdAt ? new Date(pred.createdAt).toLocaleDateString('vi-VN') : 'N/A',
          glucose: pred.glucose,
          bmi: pred.bmi,
          age: pred.age,
          bloodPressure: pred.bloodPressure,
          pregnancies: pred.pregnancies,
          insulin: pred.insulin,
          skinThickness: pred.skinThickness,
          diabetesPedigreeFunction: pred.diabetesPedigreeFunction,
        }));
        setPredictions(formattedPredictions);
        
        // Calculate statistics
        calculateStats(formattedPredictions);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Không thể tải danh sách dự đoán');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (predictionList) => {
    const total = predictionList.length;
    const avgRisk = total > 0
      ? Math.round(predictionList.reduce((sum, p) => sum + p.riskPercentage, 0) / total)
      : 0;
    
    const highRisk = predictionList.filter(p => p.riskPercentage >= 70).length;
    const mediumRisk = predictionList.filter(p => p.riskPercentage >= 30 && p.riskPercentage < 70).length;
    const lowRisk = predictionList.filter(p => p.riskPercentage < 30).length;

    setStats({ total, avgRisk, highRisk, mediumRisk, lowRisk });
  };

  const handleView = (prediction) => {
    setSelectedPrediction(prediction);
    setShowViewDialog(true);
  };

  const handleDelete = (prediction) => {
    console.log('Opening delete dialog for:', prediction);
    setSelectedPrediction(prediction);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPrediction) {
      console.log('No prediction selected');
      return;
    }

    try {
      console.log('Deleting prediction:', selectedPrediction.id);
      const response = await fetch(`${API_BASE_URL}/predictions/${selectedPrediction.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        toast.success('Đã xóa dự đoán thành công!');
        setShowDeleteDialog(false);
        setSelectedPrediction(null);
        await fetchPredictions(); // Refresh list
      } else {
        const error = await response.json();
        console.error('Delete error:', error);
        toast.error(error.message || 'Không thể xóa dự đoán');
        setShowDeleteDialog(false);
        setSelectedPrediction(null);
      }
    } catch (error) {
      console.error('Error deleting prediction:', error);
      toast.error('Không thể xóa dự đoán: ' + error.message);
      setShowDeleteDialog(false);
      setSelectedPrediction(null);
    }
  };

  const handleCancelDelete = () => {
    console.log('Delete cancelled');
    setShowDeleteDialog(false);
    setSelectedPrediction(null);
  };

  const getRiskColor = (risk) => {
    if (risk < 30) return 'text-green-600 bg-green-50';
    if (risk < 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskLabel = (risk) => {
    if (risk < 30) return 'Thấp';
    if (risk < 70) return 'Trung bình';
    return 'Cao';
  };

  const filteredPredictions = predictions.filter(pred => {
    const matchesSearch = 
      pred.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pred.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'high') return matchesSearch && pred.riskPercentage >= 70;
    if (filter === 'medium') return matchesSearch && pred.riskPercentage >= 30 && pred.riskPercentage < 70;
    if (filter === 'low') return matchesSearch && pred.riskPercentage < 30;
    return matchesSearch;
  });

  return (
    <div>
      <h1 className="mb-8 text-gray-800">Quản lý Dự đoán</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card className="bg-blue-50 border-0 rounded-[20px] p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Tổng số</p>
              <p className="text-lg font-semibold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-0 rounded-[20px] p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Xác suất TB</p>
              <p className="text-lg font-semibold text-purple-600">{stats.avgRisk}%</p>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50 border-0 rounded-[20px] p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <div>
              <p className="text-xs text-gray-600">Nguy cơ cao</p>
              <p className="text-lg font-semibold text-red-600">{stats.highRisk}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-0 rounded-[20px] p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
            <div>
              <p className="text-xs text-gray-600">Trung bình</p>
              <p className="text-lg font-semibold text-yellow-600">{stats.mediumRisk}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-0 rounded-[20px] p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <div>
              <p className="text-xs text-gray-600">Nguy cơ thấp</p>
              <p className="text-lg font-semibold text-green-600">{stats.lowRisk}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm theo tên bệnh nhân hoặc người dùng…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-300"
          />
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px] rounded-xl border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="high">Nguy cơ cao (≥70%)</SelectItem>
            <SelectItem value="medium">Trung bình (30-70%)</SelectItem>
            <SelectItem value="low">Nguy cơ thấp (&lt;30%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50 hover:bg-green-50">
                <TableHead className="text-green-700">STT</TableHead>
                <TableHead className="text-green-700">Bệnh nhân</TableHead>
                <TableHead className="text-green-700">Người dùng</TableHead>
                <TableHead className="text-green-700">Xác suất nguy cơ</TableHead>
                <TableHead className="text-green-700">Dự đoán</TableHead>
                <TableHead className="text-green-700">Ngày tạo</TableHead>
                <TableHead className="text-green-700 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPredictions.map((prediction, index) => (
                <TableRow key={prediction.id} className="hover:bg-gray-50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{prediction.patientName}</TableCell>
                  <TableCell>{prediction.userDisplayName || prediction.userName}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(prediction.riskPercentage)}`}>
                      {prediction.riskPercentage}%
                    </span>
                  </TableCell>
                  <TableCell>{prediction.prediction}</TableCell>
                  <TableCell>{prediction.createdAt}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleView(prediction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(prediction)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Chi tiết dự đoán</DialogTitle>
          </DialogHeader>
          
          {selectedPrediction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bệnh nhân</p>
                  <p className="font-semibold">{selectedPrediction.patientName}</p>
                  <p className="text-xs text-gray-500">{selectedPrediction.patientEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Người tạo</p>
                  <p className="font-semibold">{selectedPrediction.userDisplayName}</p>
                  <p className="text-xs text-gray-500">{selectedPrediction.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Xác suất nguy cơ</p>
                  <p className={`font-semibold text-lg ${getRiskColor(selectedPrediction.riskPercentage)}`}>
                    {selectedPrediction.riskPercentage}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kết quả dự đoán</p>
                  <p className="font-semibold">{selectedPrediction.prediction}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày tạo</p>
                  <p className="font-semibold">{selectedPrediction.createdAt}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-gray-700 mb-3">Thông số sức khỏe:</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Đường huyết</p>
                    <p className="font-semibold text-blue-600">{selectedPrediction.glucose} mg/dL</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">BMI</p>
                    <p className="font-semibold text-purple-600">{selectedPrediction.bmi}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Tuổi</p>
                    <p className="font-semibold text-green-600">{selectedPrediction.age} tuổi</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Huyết áp</p>
                    <p className="font-semibold text-red-600">{selectedPrediction.bloodPressure} mmHg</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Insulin</p>
                    <p className="font-semibold text-orange-600">{selectedPrediction.insulin} μU/mL</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Số lần mang thai</p>
                    <p className="font-semibold text-pink-600">{selectedPrediction.pregnancies}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowViewDialog(false)}
              className="rounded-xl"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-[20px] max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa dự đoán?</DialogTitle>
            <DialogDescription>
              {selectedPrediction && (
                <>
                  Bạn có chắc muốn xóa dự đoán của bệnh nhân <strong>{selectedPrediction.patientName}</strong>?
                  <br />
                  Hành động này không thể hoàn tác.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button 
              variant="outline"
              onClick={handleCancelDelete} 
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button 
              variant="outline"
              onClick={confirmDelete}
              className="rounded-xl text-red-600 border-red-600 hover:bg-red-50"
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
