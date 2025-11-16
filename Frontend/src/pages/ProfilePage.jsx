import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
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
  const { user, logout, updateProfile, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  // <--- SỬA 2: Thêm state cho avatarUrl
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('vi');

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleSaveProfile = async () => {
    try {
      console.log('Updating profile with:', { name, age, gender });
      const response = await updateProfile({ name, age, gender });
      console.log('Update response:', response);
      setIsEditing(false);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật hồ sơ!');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh!');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }

      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      toast.error('Vui lòng chọn ảnh!');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8017/api/v1';
      const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      console.log('Avatar upload result:', result);
      
      // Update local state with new avatar URL
      setAvatarUrl(result.data.avatar);
      setAvatarFile(null);
      
      // Refresh user data to get updated avatar from server
      await refreshUser();
      
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tải ảnh lên. Vui lòng kiểm tra Backend đã chạy chưa!');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới không khớp!');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự!');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast.error('Mật khẩu phải chứa chữ hoa, chữ thường và số!');
      return;
    }

    setIsChangingPassword(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8017/api/v1';
      const response = await fetch(`${API_BASE_URL}/users/me/change-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      toast.success('Đổi mật khẩu thành công!');
      setShowPasswordDialog(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Change password error:', error);
      if (error.message.includes('incorrect')) {
        toast.error('Mật khẩu hiện tại không đúng!');
      } else {
        toast.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu!');
      }
    } finally {
      setIsChangingPassword(false);
    }
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
                      <Camera className="w-4 h-4" />
                      Ảnh đại diện
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="avatar-file"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="rounded-xl flex-1"
                      />
                      <Button
                        onClick={handleUploadAvatar}
                        disabled={!avatarFile || isUploadingAvatar}
                        className="bg-green-600 hover:bg-green-700 rounded-xl whitespace-nowrap"
                      >
                        {isUploadingAvatar ? 'Đang tải...' : 'Tải lên'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Chọn ảnh (tối đa 5MB). Ảnh sẽ được xem trước ở bên trái.
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
                    onClick={() => setShowPasswordDialog(true)}
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

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-gray-800">Đổi mật khẩu</DialogTitle>
            <DialogDescription className="text-gray-600">
              Nhập mật khẩu hiện tại và mật khẩu mới của bạn để thay đổi.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="old-password" className="text-sm font-medium text-gray-700">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="rounded-xl h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div className="h-px bg-gray-200" />
            
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                Mật khẩu mới <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="rounded-xl h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1.5 ml-1">
                • Ít nhất 8 ký tự<br/>
                • Có chữ hoa và chữ thường<br/>
                • Có ít nhất 1 chữ số
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="rounded-xl h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-3 sm:gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="rounded-xl h-11 px-6 border-gray-300 hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="bg-green-600 hover:bg-green-700 rounded-xl h-11 px-6 min-w-[140px]"
            >
              {isChangingPassword ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Đang xử lý...
                </>
              ) : (
                'Đổi mật khẩu'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};