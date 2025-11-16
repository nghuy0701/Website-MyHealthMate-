import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Leaf, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin } from '../../lib/admin-context';

export function AdminRegisterPage() {
    const [adminName, setAdminName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAdmin();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!secretKey.trim()) {
            toast.error('Vui lòng nhập khóa bí mật!');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (!agreedToTerms) {
            toast.error('Vui lòng đồng ý với điều khoản sử dụng!');
            return;
        }

        setIsLoading(true);

        try {
            await register({
                adminName: adminName.trim(),
                displayName: displayName.trim() || adminName.trim(),
                email: email.trim(),
                password,
                secretKey: secretKey.trim()
            });
            
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.', {
                duration: 5000,
            });
            
            // Show message and redirect after delay
            setTimeout(() => {
                navigate('/admin/login');
            }, 2000);
        } catch (error) {
            // Error is already handled in admin-context with toast
            console.error('Registration error:', error);
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
                    <h1 className="text-gray-800 mb-2">Tạo tài khoản Admin</h1>
                    <p className="text-gray-600">MyHealthMate Management System</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="adminName">Tên đăng nhập Admin</Label>
                        <Input
                            id="adminName"
                            type="text"
                            placeholder="admin_user123"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            required
                            className="rounded-xl"
                            minLength={3}
                            maxLength={20}
                        />
                        <p className="text-xs text-gray-500">3-20 ký tự, chỉ chữ cái, số và dấu gạch dưới</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="displayName">Tên hiển thị</Label>
                        <Input
                            id="displayName"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

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

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Xác nhận mật khẩu
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="secretKey" className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Khóa bí mật
                        </Label>
                        <Input
                            id="secretKey"
                            type="password"
                            placeholder="••••••••"
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            required
                            className="rounded-xl"
                        />
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-yellow-800">
                                Khóa bí mật được cung cấp bởi quản trị viên hệ thống. Chỉ những người được ủy quyền mới có thể tạo tài khoản admin.
                            </p>
                        </div>
                    </div>


                    <div className="flex items-start gap-2">
                        <Checkbox
                            id="terms"
                            checked={agreedToTerms}
                            onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                            Tôi đồng ý với{' '}
                            <a href="#" className="text-green-600 hover:text-green-700">
                                Điều khoản sử dụng
                            </a>{' '}
                            và{' '}
                            <a href="#" className="text-green-600 hover:text-green-700">
                                Chính sách bảo mật
                            </a>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 rounded-xl"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <div className="text-gray-600 text-sm">
                        Đã có tài khoản?{' '}
                        <Link to="/admin/login" className="text-green-600 hover:text-green-700">
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}