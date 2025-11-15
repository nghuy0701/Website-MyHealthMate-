import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../lib/admin-context';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Shield, Plus, Edit2, Trash2, ArrowLeft, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

export function AdminManagementPage() {
  const { admin, getAllAdmins, register, updateAdmin, deleteAdmin } = useAdmin();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    adminName: '',
    password: '',
    displayName: ''
  });

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchAdmins();
  }, [admin, navigate]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (adminToEdit = null) => {
    if (adminToEdit) {
      setEditingAdmin(adminToEdit);
      setFormData({
        email: adminToEdit.email,
        adminName: adminToEdit.adminName,
        password: '',
        displayName: adminToEdit.displayName || ''
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        email: '',
        adminName: '',
        password: '',
        displayName: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAdmin(null);
    setFormData({
      email: '',
      adminName: '',
      password: '',
      displayName: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAdmin) {
        // Update existing admin
        const updateData = {
          displayName: formData.displayName
        };
        // Only include password if it's being changed
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateAdmin(editingAdmin._id, updateData);
      } else {
        // Create new admin
        await register(formData);
      }
      
      handleCloseDialog();
      fetchAdmins();
    } catch (error) {
      console.error('Error saving admin:', error);
    }
  };

  const handleDelete = async (adminId) => {
    if (admin._id === adminId) {
      toast.error('Không thể xóa tài khoản của chính bạn!');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa admin này?')) {
      try {
        await deleteAdmin(adminId);
        fetchAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
                className="rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-800">Quản lý Admins</h1>
              </div>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="rounded-2xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : admins.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Chưa có admin nào</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((adminItem) => (
                  <TableRow key={adminItem._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {adminItem.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {adminItem.adminName}
                      </div>
                    </TableCell>
                    <TableCell>{adminItem.displayName || '-'}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                        {adminItem.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(adminItem)}
                          className="rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(adminItem._id)}
                          className="rounded-lg text-red-600 hover:bg-red-50"
                          disabled={admin._id === adminItem._id}
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
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? 'Chỉnh sửa Admin' : 'Thêm Admin mới'}
            </DialogTitle>
            <DialogDescription>
              {editingAdmin
                ? 'Cập nhật thông tin admin. Email và Admin name không thể thay đổi.'
                : 'Điền thông tin để tạo tài khoản admin mới.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editingAdmin}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                type="text"
                placeholder="adminuser"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                required
                disabled={!!editingAdmin}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Mật khẩu {editingAdmin && '(để trống nếu không thay đổi)'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingAdmin}
                className="rounded-xl"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                {editingAdmin ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
