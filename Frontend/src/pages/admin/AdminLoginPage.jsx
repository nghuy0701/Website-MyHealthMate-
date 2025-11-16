import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../lib/admin-context';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Shield, Mail, Lock, Leaf, Key } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8017/api/v1';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect to the page user was trying to access, or dashboard
      const from = location.state?.from || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      
      // Check if error is due to unverified email
      if (error.message && error.message.includes('verify your email')) {
        setShowVerification(true);
        toast.info('Vui lòng xác thực email trước khi đăng nhập');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify-email/${verificationToken}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      toast.success('Email đã được xác thực thành công!');
      setShowVerification(false);
      setVerificationToken('');
      
      // Auto login after verification
      setTimeout(async () => {
        try {
          await login(email, password);
          const from = location.state?.from || '/admin/dashboard';
          navigate(from, { replace: true });
        } catch (err) {
          console.error('Auto login failed:', err);
        }
      }, 1000);
    } catch (error) {
      toast.error(error.message || 'Xác thực thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-gray-800 mb-2">Admin Portal</h1>
          <p className="text-gray-600">MyHealthMate Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@myhealthmate.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Mật khẩu
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl"
              autoComplete="current-password"
            />
          </div>

          {showVerification && (
            <div className="space-y-3 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <div className="flex items-center gap-2 text-yellow-800 font-semibold">
                <Key className="w-5 h-5" />
                <span>Email chưa được xác thực</span>
              </div>
              <p className="text-sm text-yellow-700">
                Vui lòng kiểm tra email để lấy mã xác thực hoặc click vào link trong email
              </p>
              <div className="space-y-2">
                <Label htmlFor="verificationToken" className="text-yellow-800">
                  Nhập mã xác thực (32 ký tự)
                </Label>
                <Input
                  id="verificationToken"
                  type="text"
                  placeholder="Dán mã xác thực từ email vào đây"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  className="rounded-xl font-mono text-sm"
                />
              </div>
              <Button
                type="button"
                onClick={handleVerifyEmail}
                className="w-full bg-green-600 hover:bg-green-700 rounded-xl"
                disabled={isLoading || !verificationToken.trim()}
              >
                {isLoading ? 'Đang xác thực...' : 'Xác thực ngay'}
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/register')}
              className="w-full rounded-xl border-gray-200 text-gray-700"
            >
              Đăng ký
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ⚠️ Chỉ dành cho quản trị viên hệ thống
          </p>
        </div>
      </Card>
    </div>
  );
}
