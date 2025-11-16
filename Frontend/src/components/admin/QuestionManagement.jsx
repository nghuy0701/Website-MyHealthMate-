import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
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
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { questionAPI } from '../../lib/api';

export function QuestionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [questions, setQuestions] = useState([]);

  const [formData, setFormData] = useState({
    questionId: '',
    text: '',
    type: 'select',
    placeholder: '',
    options: '',
    min: '',
    max: '',
    step: '',
    unit: '',
    hint: '',
    order: ''
  });

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getAll();
      setQuestions(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách câu hỏi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setFormData({
      questionId: question.questionId || '',
      text: question.text || '',
      type: question.type || 'select',
      placeholder: question.placeholder || '',
      options: question.options ? JSON.stringify(question.options) : '',
      min: question.min?.toString() || '',
      max: question.max?.toString() || '',
      step: question.step?.toString() || '',
      unit: question.unit || '',
      hint: question.hint || '',
      order: question.order?.toString() || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = (question) => {
    setSelectedQuestion(question);
    setShowDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setSelectedQuestion(null);
  };

  const confirmDelete = async () => {
    if (selectedQuestion) {
      try {
        await questionAPI.delete(selectedQuestion._id);
        toast.success('Đã xóa câu hỏi thành công!');
        setShowDeleteDialog(false);
        setSelectedQuestion(null);
        await fetchQuestions();
      } catch (error) {
        toast.error('Không thể xóa câu hỏi: ' + error.message);
        setShowDeleteDialog(false);
        setSelectedQuestion(null);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.questionId || !formData.text) {
      toast.error('Vui lòng nhập ID và nội dung câu hỏi!');
      return;
    }

    try {
      const questionData = {
        questionId: formData.questionId,
        text: formData.text,
        type: formData.type,
        placeholder: formData.placeholder || null,
        options: formData.options ? JSON.parse(formData.options) : null,
        min: formData.min ? parseFloat(formData.min) : null,
        max: formData.max ? parseFloat(formData.max) : null,
        step: formData.step ? parseFloat(formData.step) : null,
        unit: formData.unit || null,
        hint: formData.hint || null,
        order: formData.order ? parseInt(formData.order) : 0
      };

      if (selectedQuestion) {
        await questionAPI.update(selectedQuestion._id, questionData);
        toast.success('Cập nhật câu hỏi thành công!');
      } else {
        await questionAPI.create(questionData);
        toast.success('Thêm câu hỏi thành công!');
      }

      fetchQuestions();
      setShowAddDialog(false);
      setSelectedQuestion(null);
      setFormData({
        questionId: '',
        text: '',
        type: 'select',
        placeholder: '',
        options: '',
        min: '',
        max: '',
        step: '',
        unit: '',
        hint: '',
        order: ''
      });
    } catch (error) {
      toast.error('Không thể lưu câu hỏi: ' + error.message);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      select: 'Lựa chọn (Select)',
      number: 'Nhập số (Number)',
      text: 'Nhập text (Text)'
    };
    return labels[type] || type;
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || question.type === filter;
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
            <SelectItem value="select">Lựa chọn</SelectItem>
            <SelectItem value="number">Nhập số</SelectItem>
            <SelectItem value="text">Nhập text</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          className="bg-green-600 hover:bg-green-700 rounded-xl text-white shadow-sm"
          onClick={() => {
            setSelectedQuestion(null);
            setFormData({
              questionId: '',
              text: '',
              type: 'select',
              placeholder: '',
              options: '',
              min: '',
              max: '',
              step: '',
              unit: '',
              hint: '',
              order: ''
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Không có câu hỏi nào
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map((question, index) => (
                <TableRow key={question._id || `question-${index}`} className="hover:bg-gray-50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="text-gray-700">
                    <div className="font-medium">{question.questionId}</div>
                    <div className="text-sm text-gray-600">{question.text}</div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {getTypeLabel(question.type)}
                    {question.unit && (
                      <span className="text-xs text-gray-500 ml-2">({question.unit})</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        onClick={() => handleEdit(question)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(question)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl rounded-[20px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedQuestion ? 'Chỉnh sửa' : 'Thêm'} Câu Hỏi</DialogTitle>
            <DialogDescription>
              Điền đầy đủ thông tin để {selectedQuestion ? 'cập nhật' : 'thêm'} câu hỏi
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionId">Mã câu hỏi (ID) *</Label>
                <Input
                  id="questionId"
                  value={formData.questionId}
                  onChange={(e) => setFormData({ ...formData, questionId: e.target.value })}
                  className="rounded-xl"
                  placeholder="VD: glucose, age, gender"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Loại câu hỏi *</Label>
                <Select 
                  key={`type-${formData.type}`}
                  value={formData.type} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, type: value }));
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Lựa chọn (Select/Dropdown)</SelectItem>
                    <SelectItem value="number">Nhập số (Number)</SelectItem>
                    <SelectItem value="text">Nhập text (Text)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="text">Nội dung câu hỏi *</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="rounded-xl min-h-[60px]"
                placeholder="VD: Tuổi của bạn?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder (gợi ý nhập)</Label>
              <Input
                id="placeholder"
                value={formData.placeholder}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                className="rounded-xl"
                placeholder="VD: Nhập tuổi (VD: 25)"
              />
            </div>
            
            {formData.type === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="options">Các lựa chọn (JSON array) *</Label>
                <Textarea
                  id="options"
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  className="rounded-xl min-h-[100px] font-mono text-sm"
                  placeholder='[{"value": "male", "label": "Nam"}, {"value": "female", "label": "Nữ"}]'
                />
                <p className="text-xs text-gray-500">
                  Nhập mảng JSON với format: [{`{"value": "...", "label": "..."}`}, ...]
                </p>
              </div>
            )}
            
            {formData.type === 'number' && (
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">Min</Label>
                  <Input
                    id="min"
                    type="number"
                    value={formData.min}
                    onChange={(e) => setFormData({ ...formData, min: e.target.value })}
                    className="rounded-xl"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Max</Label>
                  <Input
                    id="max"
                    type="number"
                    value={formData.max}
                    onChange={(e) => setFormData({ ...formData, max: e.target.value })}
                    className="rounded-xl"
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step">Step</Label>
                  <Input
                    id="step"
                    type="number"
                    value={formData.step}
                    onChange={(e) => setFormData({ ...formData, step: e.target.value })}
                    className="rounded-xl"
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Đơn vị</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="rounded-xl"
                    placeholder="tuổi"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hint">Gợi ý (Hint)</Label>
                <Input
                  id="hint"
                  value={formData.hint}
                  onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                  className="rounded-xl"
                  placeholder="Tuổi hiện tại của bạn"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="order">Thứ tự hiển thị</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="rounded-xl"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
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
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-[20px] max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa câu hỏi?</DialogTitle>
            <DialogDescription>
              {selectedQuestion && (
                <>
                  Bạn có chắc muốn xóa câu hỏi <strong>{selectedQuestion.text}</strong>?
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
