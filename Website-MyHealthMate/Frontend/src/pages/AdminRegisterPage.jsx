import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '../lib/api';

export function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);

    try {
      // Convert name to userName (remove spaces, lowercase)
      const userName = formData.name.toLowerCase().replace(/\s+/g, '_');
      
      // Register admin with all required fields
      const response = await authAPI.registerAdmin({
        email: formData.email,
        password: formData.password,
        userName: userName,
        displayName: formData.name,
        phone: formData.phone || null
      });

      toast.success('Tạo tài khoản Admin thành công!');
      console.log('Admin created:', response);
      navigate('/admin/login');
    } catch (error) {
      console.error('Admin register error:', error);
      toast.error(error.message || 'Tạo tài khoản thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-gray-800 mb-2">Admin Registration</h1>
          <p className="text-gray-600">Tạo tài khoản quản trị viên</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              required
              className="rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
              className="rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại (tùy chọn)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0123456789"
              className="rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tối thiểu 8 ký tự"
              required
              className="rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              required
              className="rounded-lg"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-6"
          >
            {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản Admin'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/" className="flex items-center justify-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>
      </Card>
    </div>
  );
}
