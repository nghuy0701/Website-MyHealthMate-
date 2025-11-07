import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { User, Mail, Calendar, Users, Key, Globe, Moon, Sun, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('vi');

  const handleSaveProfile = () => {
    // The updateProfile function from useAuth should handle the API call
    updateProfile({ name, age, gender });
    setIsEditing(false);
    toast.success('Cập nhật hồ sơ thành công!');
  };

  const handleChangePassword = () => {
    toast.info('Tính năng đổi mật khẩu sẽ được cập nhật trong phiên bản tới!');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-gray-800 mb-2">Hồ sơ cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin và cài đặt tài khoản</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary */}
          <Card className="p-6 rounded-2xl shadow-lg lg:col-span-1 h-fit">
            <div className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-green-600 text-white text-2xl">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-gray-800 mb-1">{user?.name}</h2>
              <p className="text-gray-600 text-sm mb-4">{user?.email}</p>
              <Button
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              {user?.age && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{user.age} tuổi</span>
                </div>
              )}
              {user?.gender && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{user.gender}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Right Column - Details and Settings */}
          <div className="space-y-6 lg:col-span-2">
            {/* Personal Information */}
            <Card className="p-6 rounded-2xl shadow-lg">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin cá nhân
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Tuổi</Label>
                    <Input
                      id="age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Nhập tuổi"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Giới tính</Label>
                    <Select value={gender} onValueChange={setGender} disabled={!isEditing}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isEditing && (
                  <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700 rounded-xl">
                    Lưu thay đổi
                  </Button>
                )}
              </div>
            </Card>

            {/* Security */}
            <Card className="p-6 rounded-2xl shadow-lg">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Bảo mật
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-800">Mật khẩu</div>
                    <div className="text-sm text-gray-600">••••••••</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleChangePassword}
                    className="border-green-600 text-green-600 hover:bg-green-50 rounded-xl"
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </div>
            </Card>

            {/* Settings */}
            <Card className="p-6 rounded-2xl shadow-lg">
              <h3 className="text-gray-800 mb-4">Cài đặt</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === 'light' ? (
                      <Sun className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-600" />
                    )}
                    <div>
                      <div className="text-gray-800">Giao diện</div>
                      <div className="text-sm text-gray-600">Chọn chế độ hiển thị</div>
                    </div>
                  </div>
                  <Select value={theme} onValueChange={(value) => setTheme(value)}>
                    <SelectTrigger className="w-32 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Sáng</SelectItem>
                      <SelectItem value="dark">Tối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-gray-800">Ngôn ngữ</div>
                      <div className="text-sm text-gray-600">Chọn ngôn ngữ hiển thị</div>
                    </div>
                  </div>
                  <Select value={language} onValueChange={(value) => setLanguage(value)}>
                    <SelectTrigger className="w-32 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Logout */}
            <Card className="p-6 rounded-2xl shadow-lg">
              <Button
                variant="outline"
                onClick={logout}
                className="w-full border-red-600 text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
