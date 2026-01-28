import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { AdminProvider } from './lib/admin-context';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { KnowledgePage } from './pages/KnowledgePage.jsx';
import { ArticleDetailPage } from './pages/ArticleDetailPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
import { PredictionPage } from './pages/PredictionPage.jsx';
import { HistoryPage } from './pages/HistoryPage.jsx';
import { PredictionDetailPage } from './pages/PredictionDetailPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { ChatPage } from './pages/ChatPage.jsx';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.jsx';
import AdminApp from './pages/admin/AdminApp.jsx';
import { AdminRegisterPage } from './pages/admin/AdminRegisterPage.jsx';
import { AdminVerifyEmailPage } from './pages/admin/AdminVerifyEmailPage.jsx';
import { Toaster } from './components/ui/sonner';
import { AiMedicalAssistantMiniChat } from './components/chat/AiMedicalAssistantMiniChat.jsx'; // Import mini-chat

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AuthProvider>
          <Routes>
            {/* Admin Routes - No Header/Footer */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />
            <Route path="/admin/verify-email/:token" element={<AdminVerifyEmailPage />} />
            <Route path="/admin/*" element={<AdminApp />} />

            {/* Regular User Routes - With Header/Footer */}
            <Route
              path="/*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<KnowledgePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/article/:id" element={<ArticleDetailPage />} />

                      {/* Protected Routes */}
                      <Route
                        path="/prediction"
                        element={
                          <ProtectedRoute>
                            <PredictionPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/history"
                        element={
                          <ProtectedRoute>
                            <HistoryPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/prediction/:id"
                        element={
                          <ProtectedRoute>
                            <PredictionDetailPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/chat"
                        element={
                          <ProtectedRoute>
                            <ChatPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/chat/:conversationId"
                        element={
                          <ProtectedRoute>
                            <ChatPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
          <Toaster position="top-right" />
          {/* Mini Chat AI - Luôn hiển thị trên tất cả các trang */}
          <AiMedicalAssistantMiniChat />
        </AuthProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}
