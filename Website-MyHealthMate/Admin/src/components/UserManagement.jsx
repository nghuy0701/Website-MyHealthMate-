import { useState } from 'react';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([
    {
      id: '#001',
      username: 'hoangnt',
      displayName: 'Nguyễn Hoàng',
      email: 'hoang@gmail.com',
      phone: '0909123456',
      address: 'Hà Nội',
      createdAt: '01/11/2025',
    },
    {
      id: '#002',
      username: 'linhpham',
      displayName: 'Phạm Thị Linh',
      email: 'linh@gmail.com',
      phone: '0912345678',
      address: 'TP.HCM',
      createdAt: '15/10/2025',
    },
    {
      id: '#003',
      username: 'minhtran',
      displayName: 'Trần Văn Minh',
      email: 'minh@gmail.com',
      phone: '0987654321',
      address: 'Đà Nẵng',
      createdAt: '20/09/2025',
    },
  ]);

  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 'user',
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      password: '',
      role: 'user',
    });
    setShowAddDialog(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      toast.success('Đã xóa người dùng thành công!');
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const handleSave = () => {
    if (!formData.displayName || !formData.email) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (selectedUser) {
      // Edit existing user
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...formData }
          : u
      ));
      toast.success('Cập nhật người dùng thành công!');
    } else {
      // Add new user
      const newUser = {
        id: `#${String(users.length + 1).padStart(3, '0')}`,
        username: formData.username,
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };
      setUsers([...users, newUser]);
      toast.success('Thêm người dùng thành công!');
    }

    setShowAddDialog(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      displayName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      role: 'user',
    });
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="mb-8 text-gray-800">Quản lý Người dùng</h1>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm người dùng theo tên hoặc email…"
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
            <SelectItem value="date">Theo ngày tạo</SelectItem>
            <SelectItem value="role">Theo quyền</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          className="bg-blue-600 hover:bg-blue-700 rounded-xl"
          onClick={() => {
            setSelectedUser(null);
            setFormData({
              username: '',
              displayName: '',
              email: '',
              phone: '',
              address: '',
              password: '',
              role: 'user',
            });
            setShowAddDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-green-50 hover:bg-green-50">
              <TableHead className="text-green-700">Mã</TableHead>
              <TableHead className="text-green-700">Username</TableHead>
              <TableHead className="text-green-700">DisplayName</TableHead>
              <TableHead className="text-green-700">Email</TableHead>
              <TableHead className="text-green-700">Phone</TableHead>
              <TableHead className="text-green-700">Địa chỉ</TableHead>
              <TableHead className="text-green-700">Ngày tạo</TableHead>
              <TableHead className="text-green-700 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.address}</TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(user)}
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
        <DialogContent className="max-w-md rounded-[20px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Chỉnh sửa' : 'Thêm'} người dùng</DialogTitle>
            <DialogDescription>
              Điền đầy đủ thông tin để {selectedUser ? 'cập nhật' : 'thêm'} người dùng
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Tên hiển thị</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="rounded-xl"
              />
            </div>
            
            {!selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="role">Quyền</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Người dùng</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
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
            <AlertDialogTitle>Xóa người dùng?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa người dùng <strong>{selectedUser?.displayName}</strong>? 
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
    </div>
  );
}
