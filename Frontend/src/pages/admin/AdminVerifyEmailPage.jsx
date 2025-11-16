import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Leaf, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8017/api/v1';

export function AdminVerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify-email/${token}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setStatus('success');
      setMessage(data.message || 'Email verified successfully!');
      toast.success('Email đã được xác thực thành công!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Verification failed. Please try again.');
      toast.error('Xác thực email thất bại!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-gray-800 mb-2">Xác thực Email Admin</h1>
          <p className="text-gray-600">MyHealthMate Management System</p>
        </div>

        <div className="space-y-6">
          {status === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto text-purple-600 animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Đang xác thực...
              </h2>
              <p className="text-gray-600">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Xác thực thành công!
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
              </p>
              <Link to="/admin/login">
                <Button className="bg-green-600 hover:bg-green-700 rounded-xl">
                  Đăng nhập ngay
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Xác thực thất bại
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Có thể do:
                </p>
                <ul className="text-sm text-gray-600 text-left list-disc list-inside space-y-1">
                  <li>Link xác thực đã hết hạn (24 giờ)</li>
                  <li>Link xác thực không hợp lệ</li>
                  <li>Email đã được xác thực trước đó</li>
                </ul>
                <div className="flex gap-3 justify-center mt-6">
                  <Link to="/admin/register">
                    <Button variant="outline" className="rounded-xl">
                      Đăng ký lại
                    </Button>
                  </Link>
                  <Link to="/admin/login">
                    <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                      Về trang đăng nhập
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
