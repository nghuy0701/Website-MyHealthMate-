import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
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
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8017/api/v1';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    userName: '',
    displayName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    password: '',
    role: 'member',
  });

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.data) {
        // Format users data - hiển thị trống thay vì N/A cho UX tốt hơn
        const formattedUsers = data.data.map((user) => {
          return {
            id: user._id,
            userName: user.userName || '',
            displayName: user.displayName || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender ? (user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác') : '',
            dob: user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : '',
            createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '',
          };
        });
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      userName: user.userName || '',
      displayName: user.displayName || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender === 'Nam' ? 'male' : user.gender === 'Nữ' ? 'female' : user.gender === 'Khác' ? 'other' : '',
      dob: user.dob || '',
      password: '',
      role: 'member',
    });
    setShowAddDialog(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setSelectedUser(null);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast.success('Đã xóa người dùng thành công!');
        setShowDeleteDialog(false);
        setSelectedUser(null);
        await fetchUsers(); // Refresh list
      } else {
        const error = await response.json();
        console.error('Delete error:', error);
        toast.error(error.message || 'Không thể xóa người dùng');
        setShowDeleteDialog(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Không thể xóa người dùng: ' + error.message);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const handleSave = async () => {
    if (!formData.email || (!selectedUser && !formData.userName) || (!selectedUser && !formData.password)) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    try {
      if (selectedUser) {
        // Edit existing user
        const updateData = {
          displayName: formData.displayName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          dob: formData.dob,
        };
        
        const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
          await fetchUsers();
          toast.success('Cập nhật người dùng thành công!');
        } else {
          toast.error('Không thể cập nhật người dùng');
        }
      } else {
        // Add new user - Register endpoint
        const response = await fetch(`${API_BASE_URL}/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            userName: formData.userName,
            displayName: formData.displayName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            gender: formData.gender,
            dob: formData.dob,
          }),
        });

        if (response.ok) {
          await fetchUsers();
          toast.success('Thêm người dùng thành công!');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Không thể thêm người dùng');
        }
      }

      setShowAddDialog(false);
      setSelectedUser(null);
      setFormData({
        userName: '',
        displayName: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        password: '',
        role: 'member',
      });
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const filteredUsers = users.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              userName: '',
              displayName: '',
              email: '',
              phone: '',
              gender: '',
              dob: '',
              password: '',
              role: 'member',
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
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50 hover:bg-green-50">
                <TableHead className="text-green-700">STT</TableHead>
                <TableHead className="text-green-700">Username</TableHead>
                <TableHead className="text-green-700">Tên hiển thị</TableHead>
                <TableHead className="text-green-700">Email</TableHead>
                <TableHead className="text-green-700">SĐT</TableHead>
                <TableHead className="text-green-700">Giới tính</TableHead>
                <TableHead className="text-green-700">Ngày sinh</TableHead>
                <TableHead className="text-green-700">Ngày tạo</TableHead>
                <TableHead className="text-green-700 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>{user.dob}</TableCell>
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
        )}
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
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {!selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="userName">Username <span className="text-red-500">*</span></Label>
                <Input
                  id="userName"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="rounded-xl"
                  placeholder="Tên đăng nhập"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Tên hiển thị</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="rounded-xl"
                placeholder="Tên đầy đủ"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl"
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="rounded-xl"
                placeholder="0123456789"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="rounded-xl"
              />
            </div>
            
            {!selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="rounded-xl"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                />
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
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-[20px] max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa người dùng?</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  Bạn có chắc muốn xóa người dùng <strong>{selectedUser.displayName}</strong>?
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
