import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAdmin } from '../../lib/admin-context';
import { Sidebar } from '../../components/admin/Sidebar';
import { Dashboard } from '../../components/admin/Dashboard';
import { UserManagement } from '../../components/admin/UserManagement';
import { PredictionManagement } from '../../components/admin/PredictionManagement';
import { ArticleManagement } from '../../components/admin/ArticleManagement';
import { QuestionManagement } from '../../components/admin/QuestionManagement';
import { AdminProfile } from '../../components/admin/AdminProfile';

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout, updateAdmin } = useAdmin();
  const [adminProfile, setAdminProfile] = useState({
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    username: 'admin_owen',
    fullName: 'Owen Nguyễn',
    email: 'owen.admin@diabetespredictor.com',
  });

  // Get active page from URL
  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/articles')) return 'articles';
    if (path.includes('/admin/questions')) return 'questions';
    if (path.includes('/admin/profile')) return 'profile';
    return 'dashboard';
  };

  // Check if admin is logged in
  useEffect(() => {
    if (!admin) {
      // Save the current location to redirect back after login
      navigate('/admin/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    } else {
      // Update admin profile from logged in admin data
      setAdminProfile({
        avatarUrl: admin.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        username: admin.adminName || 'admin',
        fullName: admin.displayName || 'Admin',
        email: admin.email || '',
      });
    }
  }, [admin, navigate, location.pathname]);

  const handleUpdateProfile = async (updatedProfile) => {
    try {
      if (admin && admin._id) {
        await updateAdmin(admin._id, {
          displayName: updatedProfile.fullName,
          email: updatedProfile.email,
          adminName: updatedProfile.username,
          avatar: updatedProfile.avatarUrl,
        });
        setAdminProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handlePageChange = (page) => {
    const routes = {
      'dashboard': '/admin/dashboard',
      'users': '/admin/users',
      'articles': '/admin/articles',
      'questions': '/admin/questions',
      'profile': '/admin/profile',
    };
    navigate(routes[page] || '/admin/dashboard');
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        activePage={getActivePage()} 
        onPageChange={handlePageChange}
        adminProfile={adminProfile}
      />
      <main className="flex-1 ml-[280px]">
        <div className="p-8">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="predictions" element={<PredictionManagement />} />
            <Route path="articles" element={<ArticleManagement />} />
            <Route path="questions" element={<QuestionManagement />} />
            <Route path="profile" element={<AdminProfile profile={adminProfile} onUpdateProfile={handleUpdateProfile} />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
