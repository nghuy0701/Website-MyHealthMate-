import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrediction } from '../lib/hooks/usePrediction';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  User,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function PredictionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPredictionById, loading, error } = usePrediction();
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    loadPrediction();
  }, [id]);

  const loadPrediction = async () => {
    try {
      const data = await getPredictionById(id);
      setPrediction(data);
    } catch (err) {
      toast.error('Không thể tải chi tiết dự đoán');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-8 rounded-2xl shadow-lg text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl text-gray-800 mb-2">Không tìm thấy dự đoán</h2>
            <p className="text-gray-600 mb-6">{error || 'Dữ liệu không tồn tại hoặc đã bị xóa.'}</p>
            <Button onClick={() => navigate('/history')} className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại lịch sử
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate risk level based on probability
  const getRiskLevel = (probability) => {
    if (probability < 30) return 'low';
    if (probability < 70) return 'medium';
    return 'high';
  };

  const riskLevel = getRiskLevel(prediction.result?.probability || 0);

  const riskConfig = {
    low: {
      label: 'Thấp',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: TrendingDown,
      advice: 'Kết quả tốt! Hãy duy trì lối sống lành mạnh hiện tại.',
    },
    medium: {
      label: 'Trung bình',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: Minus,
      advice: 'Cần chú ý! Hãy cải thiện chế độ ăn uống và tăng cường vận động.',
    },
    high: {
      label: 'Cao',
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: TrendingUp,
      advice: 'Cảnh báo! Nên gặp bác sĩ chuyên khoa để được tư vấn và kiểm tra kỹ hơn.',
    },
  };

  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const inputFields = [
    { label: 'Số lần mang thai', key: 'pregnancies', unit: 'lần' },
    { label: 'Glucose', key: 'glucose', unit: 'mg/dL' },
    { label: 'Huyết áp', key: 'bloodPressure', unit: 'mmHg' },
    { label: 'Độ dày da', key: 'skinThickness', unit: 'mm' },
    { label: 'Insulin', key: 'insulin', unit: 'µU/mL' },
    { label: 'BMI', key: 'bmi', unit: 'kg/m²' },
    { label: 'Chức năng di truyền', key: 'diabetesPedigreeFunction', unit: '' },
    { label: 'Tuổi', key: 'age', unit: 'tuổi' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/history')}
            className="mb-4 hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại lịch sử
          </Button>
          <h1 className="text-gray-800 mb-2">Chi tiết dự đoán</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(prediction.createdAt)}</span>
          </div>
        </div>

        {/* Risk Result */}
        <Card className={`p-8 rounded-2xl shadow-lg border-2 mb-6 ${config.color}`}>
          <div className="flex items-center gap-4 mb-4">
            <Icon className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold mb-1">Mức nguy cơ: {config.label}</h2>
              <p className="text-lg">Xác suất: {prediction.result?.probability || 0}%</p>
            </div>
          </div>
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="font-medium">{config.advice}</p>
          </div>
        </Card>

        {/* Patient Info */}
        {prediction.patientId && (
          <Card className="p-6 rounded-2xl shadow-lg mb-6">
            <h3 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin bệnh nhân
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Mã BN:</span>
                <p className="font-medium">{prediction.patientId._id || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Họ tên:</span>
                <p className="font-medium">{prediction.patientId.fullName || 'N/A'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Input Data */}
        <Card className="p-6 rounded-2xl shadow-lg mb-6">
          <h3 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Dữ liệu đầu vào
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputFields.map((field) => (
              <div key={field.key} className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-gray-600">{field.label}</span>
                <p className="text-lg font-medium text-gray-800">
                  {prediction.inputData?.[field.key] || 0}
                  {field.unit && ` ${field.unit}`}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Prediction Result Details */}
        {prediction.result && (
          <Card className="p-6 rounded-2xl shadow-lg mb-6">
            <h3 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Kết quả chi tiết
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dự đoán:</span>
                <Badge className={config.color}>
                  {prediction.result.prediction === 1 ? 'Có nguy cơ tiểu đường' : 'Không có nguy cơ'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Xác suất:</span>
                <span className="font-medium">{prediction.result.probability}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Độ tin cậy:</span>
                <span className="font-medium">{prediction.result.confidence || 'N/A'}</span>
              </div>
              {prediction.result.modelVersion && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phiên bản mô hình:</span>
                  <span className="font-medium">{prediction.result.modelVersion}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Notes */}
        {prediction.notes && (
          <Card className="p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl text-gray-800 mb-4">Ghi chú</h3>
            <p className="text-gray-600">{prediction.notes}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
