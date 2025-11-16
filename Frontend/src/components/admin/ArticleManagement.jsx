import { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Expand } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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
import { ImageWithFallback } from './figma/ImageWithFallback.jsx';

import { articles as articlesData, categoryLabels } from '../../lib/data';

const initialArticles = articlesData.map((article, index) => ({
  id: article.id,
  code: `B${String(index + 1).padStart(3, '0')}`,
  title: article.title,
  description: article.excerpt,
  image: article.imageUrl,
  category: article.category,
  content: article.content ? JSON.stringify(article.content, null, 2) : '',
}));

const truncateText = (text = '', maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export function ArticleManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [articles, setArticles] = useState(initialArticles);

  const [isContentMaximized, setIsContentMaximized] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    image: '',
    category: 'nutrition',
    content: '',
  });

  const handleView = (article) => {
    setSelectedArticle(article);
    setShowViewDialog(true);
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
    setFormData({
      code: article.code,
      title: article.title,
      description: article.description,
      image: article.image,
      category: article.category,
      content: article.content,
    });
    setShowAddDialog(true);
  };

  const handleDelete = (article) => {
    setSelectedArticle(article);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedArticle) {
      setArticles(articles.filter(a => a.id !== selectedArticle.id));
      toast.success('Đã xóa bài viết thành công!');
      setShowDeleteDialog(false);
      setSelectedArticle(null);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.description) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (selectedArticle) {
      setArticles(articles.map(a =>
        a.id === selectedArticle.id
          ? { ...a, ...formData }
          : a
      ));
      toast.success('Cập nhật bài viết thành công!');
    } else {
      const newArticle = {
        id: String(articles.length + 1),
        code: formData.code || `B${String(articles.length + 1).padStart(3, '0')}`,
        title: formData.title,
        description: formData.description,
        image: formData.image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100',
        category: formData.category,
        content: formData.content,
      };
      setArticles([...articles, newArticle]);
      toast.success('Thêm bài viết thành công!');
    }

    setShowAddDialog(false);
    setSelectedArticle(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      image: '',
      category: 'nutrition',
      content: '',
    });
  };

  const getCategoryLabel = (category) => {
    return categoryLabels[category] || category;
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || article.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <h1 className="mb-8 text-gray-800">Quản lý Bài viết</h1>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm bài viết theo tiêu đề…"
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
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          className="bg-blue-600 hover:bg-blue-700 rounded-xl"
          onClick={() => {
            setSelectedArticle(null);
            setFormData({
              code: '',
              title: '',
              description: '',
              image: '',
              category: 'nutrition',
              content: '',
            });
            setShowAddDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm bài viết
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-green-50 hover:bg-green-50">
              <TableHead className="text-green-700">STT</TableHead>
              <TableHead className="text-green-700">Mã</TableHead>
              <TableHead className="text-green-700">Tiêu đề</TableHead>
              <TableHead className="text-green-700">Mô tả ngắn</TableHead>
              <TableHead className="text-green-700">Danh mục</TableHead>
              <TableHead className="text-green-700">Ảnh đại diện</TableHead>
              <TableHead className="text-green-700 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.map((article, index) => (
              <TableRow key={article.id} className="hover:bg-gray-50">
                <TableCell>{index + 1}</TableCell>
                <TableCell>{article.code}</TableCell>
                <TableCell className="max-w-xs">{truncateText(article.title, 30)}</TableCell>
                <TableCell className="max-w-md text-gray-600">{truncateText(article.description, 50)}</TableCell>
                <TableCell>{getCategoryLabel(article.category)}</TableCell>
                <TableCell>
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleView(article)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(article)}
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

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Chi tiết bài viết</DialogTitle>
          </DialogHeader>

          {selectedArticle && (
            <div className="space-y-4 py-4">
              <ImageWithFallback
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-xl"
              />
              <h3 className="text-gray-800">{selectedArticle.title}</h3>
              <p className="text-gray-600">{selectedArticle.description}</p>
              <div className="pt-4 border-t">
                <p className="text-gray-700">{selectedArticle.content}</p>
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

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl rounded-[20px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle ? 'Chỉnh sửa' : 'Thêm'} bài viết</DialogTitle>
            <DialogDescription>
              Điền đầy đủ thông tin để {selectedArticle ? 'cập nhật' : 'thêm'} bài viết
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã bài viết</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="rounded-xl"
                placeholder="VD: B001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả ngắn</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL Ảnh đại diện</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="rounded-xl"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Nội dung</Label>
                <Button variant="ghost" size="sm" onClick={() => setIsContentMaximized(true)}>
                  <Expand className="w-4 h-4 mr-2" />
                  Phóng to
                </Button>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="rounded-xl min-h-[150px]"
              />
            </div>
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
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa bài viết <strong>{selectedArticle?.title}</strong>?
              Hành động này không thể hoàn tác.
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

      {/* Maximized Content Editor Dialog */}
      <Dialog open={isContentMaximized} onOpenChange={setIsContentMaximized}>
        <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nội dung</DialogTitle>
          </DialogHeader>
          <div className="flex-grow mt-4">
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full h-full rounded-xl resize-none border-gray-300"
              placeholder="Nhập nội dung chi tiết cho bài viết..."
            />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsContentMaximized(false)} className="rounded-xl bg-blue-600 hover:bg-blue-700">
              Hoàn tất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
