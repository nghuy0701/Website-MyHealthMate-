import React, { useState, useEffect } from 'react';
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
// <--- SỬA 1: Thêm 'Camera' vào import
import { User, Mail, Calendar, Users, Key, Globe, Moon, Sun, LogOut, Camera } from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  // <--- SỬA 2: Thêm state cho avatarUrl
  const [avatarUrl, setAvatarUrl] = useState('');

  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('vi');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAge(user.age || '');
      setGender(user.gender || '');
      // <--- SỬA 3: Cập nhật avatarUrl state khi có user
      setAvatarUrl(user.avatar || '');
    }
  }, [user]);

  const handleToggleEdit = () => {
    const isNowEditing = !isEditing;
    setIsEditing(isNowEditing);
    // Nếu bắt đầu chỉnh sửa, reset form về giá trị của user
    if (isNowEditing) {
      setName(user?.name || '');
      setAge(user?.age || '');
      setGender(user?.gender || '');
      // <--- SỬA 4: Reset cả avatarUrl khi bấm "Chỉnh sửa"
      setAvatarUrl(user?.avatar || '');
    }
  };

  const handleSaveProfile = () => {
    // <--- SỬA 5: Thêm 'avatar: avatarUrl' vào object update
    updateProfile({ name, age, gender, avatar: avatarUrl });
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
              {/* <--- SỬA 6: Thêm 'relative' để icon camera đè lên */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Avatar className="w-24 h-24">
                  {/* <--- SỬA 7: Hiển thị avatarUrl (preview) khi đang sửa */}
                  <AvatarImage src={isEditing ? avatarUrl : user?.avatar} />
                  <AvatarFallback className="bg-green-600 text-white text-2xl">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                {/* <--- SỬA 8: Thêm icon Camera khi đang sửa (giống code .tsx gốc) */}
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 bg-green-600 text-white rounded-full p-2 shadow-lg">
                    <Camera className="w-4 h-4" />
                  </div>
                )}
              </div>
              <h2 className="text-gray-800 mb-1">{user?.name}</h2>
              <p className="text-gray-600 text-sm mb-4">{user?.email}</p>
              <Button
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
                onClick={handleToggleEdit}
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
              {/* Hiển thị tuổi từ state (nếu đang sửa) hoặc từ user */}
              {(isEditing ? age : user?.age) && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{isEditing ? age : user.age} tuổi</span>
                </div>
              )}
              {/* Hiển thị giới tính từ state (nếu đang sửa) hoặc từ user */}
              {(isEditing ? gender : user?.gender) && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{isEditing ? gender : user.gender}</span>
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

                {/* Đây là đoạn code bạn đã thêm - giờ nó sẽ hoạt động */}
                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="flex items-center gap-2">
                      <Camera className="w-4 h-4" /> {/* Sẽ hoạt động vì đã import */}
                      URL Avatar
                    </Label>
                    <Input
                      id="avatar"
                      value={avatarUrl} // Sẽ hoạt động vì đã có useState
                      onChange={(e) => setAvatarUrl(e.target.value)} // Sẽ hoạt động
                      placeholder="https://example.com/avatar.jpg"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-gray-500">
                      Nhập đường dẫn ảnh đại diện của bạn. Avatar sẽ được xem trước ở bên trái.
                    </p>
                  </div>
                )}
                {/* Hết đoạn code bạn thêm */}

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
                    <Select value={gender} onValueChange={(value) => setGender(value)} disabled={!isEditing}>
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
};