import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Calendar, Download, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

// ✅ Hộp thoại xác nhận — Đã chuyển 100% sang "style" để "ép" di chuyển
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  // Style cho nút "ngang" (theo code của bạn)
  const horizontalButtonStyle = {
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: '24px',
    paddingRight: '24px',
  };

  // Style cho toàn bộ HỘP THOẠI (theo code của bạn)
  const dialogBoxStyle = {
    minWidth: '450px',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '48px',
    paddingRight: '48px',
    // Thêm các style này để nó không bị "đè"
    position: 'relative', // (relative cho z-50)
    zIndex: 50,
    backgroundColor: 'white',
    borderRadius: '16px', // tương đương rounded-2xl
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // tương đương shadow-xl
  };

  // Style cho TIÊU ĐỀ
  const titleStyle = {
    marginBottom: '12px',
    fontSize: '1.125rem', // text-lg
    fontWeight: '700', // font-bold
    color: '#374151', // text-gray-800
  };

  // Style cho DÒNG CHỮ
  const messageStyle = {
    marginBottom: '48px',
    color: '#4B5563', // text-gray-600
  };

  // ✅✅✅ GIẢI PHÁP CHO BẠN
  // Style cho NỀN MỜ (thay thế cho "fixed inset-0 z-40 flex...")
  const wrapperStyle = {
    position: 'fixed', // <-- "DÍNH VÀ ĐI THEO MÀN HÌNH"
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // (bg-black bg-opacity-50)
  };


  return (
    // ✅ ĐÃ THAY THẾ TOÀN BỘ "className" BẰNG "style"
    <div
      style={wrapperStyle}
      onClick={onCancel} // Bấm ra ngoài để huỷ
    >
      {/* HỘP THOẠI CHÍNH */}
      <div
        style={dialogBoxStyle} // <-- ÁP DỤNG STYLE
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={titleStyle} // <-- ÁP DỤNG STYLE
        >
          {title}
        </h3>

        <p
          style={messageStyle} // <-- ÁP DỤNG STYLE
        >
          {message}
        </p>

        <div className="flex justify-center gap-6">
          {/* Nút OK */}
          <button
            onClick={() => {
              onConfirm && onConfirm();
            }}
            style={horizontalButtonStyle}
            className="min-w-[110px] rounded-full border-2 border-green-600 bg-white text-lg font-medium text-green-600 hover:bg-green-50"
          >
            OK
          </button>

          {/* Nút Huỷ */}
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

// ==========================================================
// ✅ Code của trang HistoryPage - Không thay đổi
// ==========================================================
export function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    message: '',
    onConfirm: null,
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const saved = localStorage.getItem('prediction_history');
    if (saved) {
      const allHistory = JSON.parse(saved);
      const userHistory = allHistory.filter((h) => h.userId === user?.id);
      setHistory(userHistory);
    }
  };

  const filteredHistory = history.filter((h) => filter === 'all' || h.riskLevel === filter);

  const clearHistory = async () => {
    setConfirmDialog({
      open: true,
      message: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử?',
      onConfirm: () => {
        const allHistory = JSON.parse(localStorage.getItem('prediction_history') || '[]');
        const otherHistory = allHistory.filter((h) => h.userId !== user?.id);
        localStorage.setItem('prediction_history', JSON.stringify(otherHistory));
        setHistory([]);
        toast.success('Đã xóa lịch sử!');
        setConfirmDialog({ open: false });
      },
    });
  };

  const deleteRecord = async (id) => {
    setConfirmDialog({
      open: true,
      message: 'Bạn có chắc chắn muốn xóa bản ghi này?',
      onConfirm: () => {
        const allHistory = JSON.parse(localStorage.getItem('prediction_history') || '[]');
        const newHistory = allHistory.filter((h) => h.id !== id);
        localStorage.setItem('prediction_history', JSON.stringify(newHistory));
        loadHistory();
        toast.success('Đã xóa bản ghi!');
        setConfirmDialog({ open: false });
      },
    });
  };

  const exportToPDF = () => {
    toast.info('Tính năng xuất PDF sẽ được cập nhật trong phiên bản tới!');
  };

  const riskConfig = {
    low: { label: 'Thấp', color: 'bg-green-100 text-green-700', icon: TrendingDown },
    medium: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700', icon: Minus },
    high: { label: 'Cao', color: 'bg-red-100 text-red-700', icon: TrendingUp },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      {/* Hộp thoại xác nhận đặt ở đầu để nổi phía trên */}
      <ConfirmDialog
        open={confirmDialog.open}
        front-weight="bold"
        title="Xác nhận"
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ open: false })}
      />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-gray-800 mb-2">Lịch sử dự đoán</h1>
          <p className="text-gray-600">Xem lại các kết quả đánh giá trước đây</p>
        </div>

        {/* Filters and Actions */}
        <Card className="p-6 rounded-2xl shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Lọc theo mức nguy cơ:</span>
              <Select value={filter} onValueChange={(value) => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={exportToPDF}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất PDF
              </Button>
              <Button
                variant="outline"
                onClick={clearHistory}
                disabled={history.length === 0}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa lịch sử
              </Button>
            </div>
          </div>
        </Card>

        {/* History Table */}
        {filteredHistory.length > 0 ? (
          <Card className="rounded-2xl shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày / Giờ</TableHead>
                  <TableHead>Mức nguy cơ</TableHead>
                  <TableHead>Xác suất</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((record) => {
                  const config = riskConfig[record.riskLevel];
                  const Icon = config.icon;
                  const date = new Date(record.date);

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div>{date.toLocaleDateString('vi-VN')}</div>
                            <div className="text-sm text-gray-500">{date.toLocaleTimeString('vi-VN')}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={config.color}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-lg">{record.probability}%</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" className="rounded-lg">
                            Chi tiết
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteRecord(record.id)}
                            className="rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="p-12 rounded-2xl shadow-lg text-center">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-gray-800 mb-2">Chưa có lịch sử</h3>
            <p className="text-gray-600 mb-6">Bạn chưa thực hiện đánh giá nào. Hãy bắt đầu ngay!</p>
            <Button className="bg-green-600 hover:bg-green-700">Bắt đầu đánh giá</Button>
          </Card>
        )}

        {/* Summary Stats */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="p-6 rounded-2xl shadow-lg">
              <div className="text-gray-600 mb-2">Tổng số đánh giá</div>
              <div className="text-3xl text-gray-800">{history.length}</div>
            </Card>
            <Card className="p-6 rounded-2xl shadow-lg">
              <div className="text-gray-600 mb-2">Đánh giá gần nhất</div>
              <div className="text-xl text-gray-800">
                {new Date(history[0].date).toLocaleDateString('vi-VN')}
              </div>
            </Card>
            <Card className="p-6 rounded-2xl shadow-lg">
              <div className="text-gray-600 mb-2">Xác suất trung bình</div>
              <div className="text-3xl text-gray-800">
                {Math.round(history.reduce((sum, h) => sum + h.probability, 0) / history.length)}%
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}