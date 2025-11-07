import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Leaf, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Add API call to backend for password reset
    // Example:
    // try {
    //   const response = await fetch('/api/forgot-password', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email }),
    //   });
    //   if (response.ok) {
    //     setIsSuccess(true);
    //     toast.success('Email khôi phục mật khẩu đã được gửi!');
    //   } else {
    //     toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    //   }
    // } catch (error) {
    //   toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    // } finally {
    //   setIsLoading(false);
    // }

    // Mock password reset
    setTimeout(() => {
      setIsSuccess(true);
      setIsLoading(false);
      toast.success('Email khôi phục mật khẩu đã được gửi!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-gray-800 mb-2">Quên mật khẩu?</h1>
          <p className="text-gray-600">Nhập email để nhận link khôi phục mật khẩu</p>
        </div>

        {isSuccess ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Chúng tôi đã gửi link khôi phục mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.
              </AlertDescription>
            </Alert>
            <Link to="/login" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700 rounded-xl">
                Quay lại Đăng nhập
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi link khôi phục'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-green-600 hover:text-green-700 text-sm">
            ← Quay lại Đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
}
