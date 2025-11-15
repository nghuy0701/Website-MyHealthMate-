import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UserManagement } from './components/UserManagement';
import { ArticleManagement } from './components/ArticleManagement';
import { QuestionManagement } from './components/QuestionManagement';
import { AdminProfile } from './components/AdminProfile';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function AdminLayout() {
  const [activePage, setActivePage] = useState('dashboard');
  const [adminProfile, setAdminProfile] = useState({
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    username: 'admin_owen',
    fullName: 'Owen Nguyễn',
    email: 'owen.admin@diabetespredictor.com',
  });

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'articles':
        return <ArticleManagement />;
      case 'questions':
        return <QuestionManagement />;
      case 'profile':
        return <AdminProfile profile={adminProfile} onUpdateProfile={setAdminProfile} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        activePage={activePage} 
        onPageChange={setActivePage}
        adminProfile={adminProfile}
      />
      <main className="flex-1 ml-[280px]">
        <div className="p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
