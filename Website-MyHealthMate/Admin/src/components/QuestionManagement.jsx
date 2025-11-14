import { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';

export function QuestionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  const [questions, setQuestions] = useState([
    { id: 1, content: 'Bạn có thường xuyên cảm thấy khát nước hơn bình thường không?', type: 'yes_no' },
    { id: 2, content: 'Bạn có thường xuyên đi tiểu nhiều lần trong ngày không?', type: 'yes_no' },
    { id: 3, content: 'Bạn có cảm thấy mệt mỏi, uể oải dù nghỉ ngơi đầy đủ không?', type: 'yes_no' },
    { id: 4, content: 'Bạn có bị giảm cân không rõ nguyên nhân trong thời gian gần đây không?', type: 'yes_no' },
    { id: 5, content: 'Bạn có ăn nhiều nhưng vẫn thấy đói nhanh không?', type: 'yes_no' },
    { id: 6, content: 'Bạn có thường xuyên bị mờ mắt hoặc giảm thị lực tạm thời không?', type: 'yes_no' },
    { id: 7, content: 'Bạn có từng được bác sĩ chẩn đoán huyết áp cao chưa?', type: 'yes_no' },
    { id: 8, content: 'Trong gia đình bạn có ai mắc bệnh tiểu đường không?', type: 'yes_no' },
    { id: 9, content: 'Bạn có ít vận động thể dục thể thao (dưới 2 buổi/tuần)?', type: 'yes_no' },
    { id: 10, content: 'Bạn có thường xuyên sử dụng đồ ngọt (bánh, nước ngọt, trà sữa, cà phê sữa)?', type: 'yes_no' },
    { id: 11, content: 'Bạn có thừa cân hoặc béo phì (BMI > 25) không?', type: 'yes_no' },
    { id: 12, content: 'Bạn có hút thuốc hoặc uống rượu bia thường xuyên không?', type: 'yes_no' },
    { id: 13, content: 'Tuổi của bạn nằm trong nhóm nào?', type: 'choice', options: ['Dưới 30', '30–45', 'Trên 45'] },
    { id: 14, content: 'Giới tính của bạn là gì?', type: 'choice', options: ['Nam', 'Nữ'] },
    { id: 15, content: 'Bạn có thường xuyên bị tê hoặc ngứa ran ở tay/chân không?', type: 'yes_no' },
  ]);

  const [formData, setFormData] = useState({
    content: '',
    type: 'yes_no',
    options: '',
  });

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setFormData({
      content: question.content,
      type: question.type,
      options: question.options?.join(', ') || '',
    });
    setShowAddDialog(true);
  };

  const handleDelete = (question) => {
    setSelectedQuestion(question);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedQuestion) {
      setQuestions(questions.filter(q => q.id !== selectedQuestion.id));
      toast.success('Đã xóa câu hỏi thành công!');
      setShowDeleteDialog(false);
      setSelectedQuestion(null);
    }
  };

  const handleSave = () => {
    if (!formData.content) {
      toast.error('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    if (formData.type === 'choice' && !formData.options) {
      toast.error('Vui lòng nhập các lựa chọn!');
      return;
    }

    const questionData = {
      id: selectedQuestion?.id || Math.max(...questions.map(q => q.id), 0) + 1,
      content: formData.content,
      type: formData.type,
      options: formData.type === 'choice' ? formData.options.split(',').map(o => o.trim()) : undefined,
    };

    if (selectedQuestion) {
      setQuestions(questions.map(q => 
        q.id === selectedQuestion.id ? questionData : q
      ));
      toast.success('Cập nhật câu hỏi thành công!');
    } else {
      setQuestions([...questions, questionData]);
      toast.success('Thêm câu hỏi thành công!');
    }

    setShowAddDialog(false);
    setSelectedQuestion(null);
    setFormData({
      content: '',
      type: 'yes_no',
      options: '',
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      yes_no: 'Có / Không',
      choice: 'Lựa chọn',
      text: 'Tự nhập',
    };
    return labels[type] || type;
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'yes_no' && question.type === 'yes_no') ||
      (filter === 'choice' && question.type === 'choice') ||
      (filter === 'text' && question.type === 'text');
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <h1 className="mb-8 text-gray-800">Quản lý Bộ Câu hỏi</h1>

      {/* Stats Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0 rounded-[20px] p-6 shadow-sm mb-6">
        <div className="space-y-2">
          <p className="text-gray-700">
            Bộ câu hỏi hiện có: <strong className="text-green-600">{questions.length} câu hỏi</strong>
          </p>
          <p className="text-sm text-gray-600">
            Lần cập nhật gần nhất: <strong>09/11/2025</strong>, bởi <strong>Admin Owen</strong>
          </p>
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm câu hỏi theo nội dung…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-300"
          />
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] rounded-xl border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="yes_no">Có/Không</SelectItem>
            <SelectItem value="choice">Lựa chọn</SelectItem>
            <SelectItem value="text">Tự nhập</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          className="bg-blue-600 hover:bg-blue-700 rounded-xl"
          onClick={() => {
            setSelectedQuestion(null);
            setFormData({
              content: '',
              type: 'yes_no',
              options: '',
            });
            setShowAddDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm câu hỏi
        </Button>

        <div className="text-sm text-gray-600">
          Hiện có <strong>{filteredQuestions.length}</strong> câu hỏi trong hệ thống.
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-green-50 hover:bg-green-50">
              <TableHead className="text-green-700 w-[60px]">STT</TableHead>
              <TableHead className="text-green-700">Nội dung câu hỏi</TableHead>
              <TableHead className="text-green-700 w-[250px]">Loại trả lời</TableHead>
              <TableHead className="text-green-700 text-center w-[120px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question, index) => (
              <TableRow key={question.id} className="hover:bg-gray-50">
                <TableCell>{index + 1}</TableCell>
                <TableCell className="text-gray-700">{question.content}</TableCell>
                <TableCell className="text-gray-600">
                  {getTypeLabel(question.type)}
                  {question.options && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({question.options.join(' / ')})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEdit(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(question)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg rounded-[20px]">
          <DialogHeader>
            <DialogTitle>{selectedQuestion ? 'Chỉnh sửa' : 'Thêm'} Câu Hỏi</DialogTitle>
            <DialogDescription>
              Điền đầy đủ thông tin để {selectedQuestion ? 'cập nhật' : 'thêm'} câu hỏi
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">Nội dung câu hỏi</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="rounded-xl min-h-[80px]"
                placeholder="Nhập nội dung câu hỏi..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Loại trả lời</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Có / Không</SelectItem>
                  <SelectItem value="choice">Lựa chọn (dropdown nhiều đáp án)</SelectItem>
                  <SelectItem value="text">Tự nhập (text)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.type === 'choice' && (
              <div className="space-y-2">
                <Label htmlFor="options">Các lựa chọn (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="options"
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  className="rounded-xl"
                  placeholder="VD: Dưới 30, 30-45, Trên 45"
                />
                <p className="text-xs text-gray-500">
                  Nhập các đáp án, cách nhau bằng dấu phẩy
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="rounded-xl"
            >
              ❌ Hủy
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 rounded-xl"
              onClick={handleSave}
            >
              💾 Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa câu hỏi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 rounded-xl"
              onClick={confirmDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
