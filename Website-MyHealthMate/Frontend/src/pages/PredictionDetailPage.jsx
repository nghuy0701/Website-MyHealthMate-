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
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  // Style cho nút "ngang"
  const horizontalButtonStyle = {
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: '24px',
    paddingRight: '24px',
  };

  // Style cho toàn bộ HỘP THOẠI
  const dialogBoxStyle = {
    minWidth: '450px',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '48px',
    paddingRight: '48px',
    position: 'relative',
    zIndex: 50,
    backgroundColor: 'white',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  };

  // Style cho TIÊU ĐỀ
  const titleStyle = {
    marginBottom: '12px',
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#374151',
  };

  // Style cho DÒNG CHỮ
  const messageStyle = {
    marginBottom: '48px',
    color: '#4B5563',
  };

  // Style cho NỀN MỜ
  const wrapperStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  };

  return (
    <div style={wrapperStyle} onClick={onCancel}>
      <div style={dialogBoxStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={titleStyle}>{title}</h3>
        <p style={messageStyle}>{message}</p>
        <div className="flex justify-center gap-6">
          <button
            onClick={() => {
              onConfirm && onConfirm();
            }}
            style={horizontalButtonStyle}
            className="min-w-[110px] rounded-full border-2 border-green-600 bg-white text-lg font-medium text-green-600 hover:bg-green-50"
          >
            OK
          </button>
          <button
            onClick={onCancel}
            style={horizontalButtonStyle}
            className="min-w-[110px] rounded-full bg-green-600 text-lg font-medium text-white hover:bg-green-700"
          >
            Huỷ
          </button>
        </div>
      </div>
    </div>
  );
}

export function PredictionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPredictionById, deletePrediction, loading, error } = usePrediction();
  const [prediction, setPrediction] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    message: '',
    onConfirm: null,
  });

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

  // Calculate risk level from probability
  const getRiskLevel = (probability) => {
    if (probability < 30) return 'low';
    if (probability < 70) return 'medium';
    return 'high';
  };

  const riskLevel = getRiskLevel(prediction.probability || 0);

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

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      message: 'Bạn có chắc chắn muốn xóa dự đoán này?',
      onConfirm: async () => {
        try {
          await deletePrediction(id);
          toast.success('Đã xóa dự đoán!');
          navigate('/history');
        } catch (err) {
          toast.error('Không thể xóa dự đoán');
        }
        setConfirmDialog({ open: false });
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      {/* Hộp thoại xác nhận đặt ở đầu để nổi phía trên */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Xác nhận"
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ open: false })}
      />

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
              <p className="text-lg">Xác suất: {prediction.probability || 0}%</p>
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
                  {prediction[field.key] || 0}
                  {field.unit && ` ${field.unit}`}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Prediction Result Details */}
        <Card className="p-6 rounded-2xl shadow-lg mb-6">
          <h3 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Kết quả chi tiết
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dự đoán:</span>
              <Badge className={config.color}>
                {prediction.prediction === 1 ? 'Có nguy cơ tiểu đường' : 'Không có nguy cơ'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Xác suất:</span>
              <span className="font-medium">{prediction.probability}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mức nguy cơ:</span>
              <span className="font-medium">{prediction.riskLevel || 'N/A'}</span>
            </div>
            {prediction.modelVersion && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phiên bản mô hình:</span>
                <span className="font-medium">{prediction.modelVersion}</span>
              </div>
            )}
            {prediction.modelUsed && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mô hình sử dụng:</span>
                <span className="font-medium">{prediction.modelUsed}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Notes */}
        {prediction.notes && (
          <Card className="p-6 rounded-2xl shadow-lg mb-6">
            <h3 className="text-xl text-gray-800 mb-4">Ghi chú</h3>
            <p className="text-gray-600">{prediction.notes}</p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/history')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại lịch sử
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="rounded-xl border-red-600 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa dự đoán
          </Button>
        </div>
      </div>
    </div>
  );
}
