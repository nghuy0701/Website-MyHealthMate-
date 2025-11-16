import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Leaf, Lock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
export function AdminRegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [address, setAddress] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // UI-only registration for admin (no API calls). This page mirrors admin register layout.
    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (!agreedToTerms) {
            toast.error('Vui lòng đồng ý với điều khoản sử dụng!');
            return;
        }

        setIsLoading(true);

        // Simulate success (UI-only). Do not call APIs here per request.
        setTimeout(() => {
            setIsLoading(false);
            // Note: all provided values remain client-side only in this UI-only flow.
            toast.success('Tài khoản Admin (UI-only) đã được tạo — hãy đăng nhập.');
            navigate('/admin/login');
        }, 800);
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Tên</Label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="Văn"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="rounded-xl"
                            />
                        </div>
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
                            className="rounded-xl"
                        />
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