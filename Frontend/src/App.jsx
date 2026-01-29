import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import { AdminProvider } from "./lib/admin-context";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { NotificationDrawer } from "./components/notification/NotificationDrawer";
import { NotificationInitializer } from "./components/notification/NotificationInitializer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { KnowledgePage } from "./pages/KnowledgePage.jsx";
import { ArticleDetailPage } from "./pages/ArticleDetailPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage.jsx";
import { PredictionPage } from "./pages/PredictionPage.jsx";
import { HistoryPage } from "./pages/HistoryPage.jsx";
import { PredictionDetailPage } from "./pages/PredictionDetailPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { ChatPage } from "./pages/ChatPage.jsx";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage.jsx";
import { AdminRegisterPage } from "./pages/admin/AdminRegisterPage.jsx";
import { AdminVerifyEmailPage } from "./pages/admin/AdminVerifyEmailPage.jsx";
import { Toaster } from "./components/ui/sonner";
import { AiMedicalAssistantMiniChat } from "./components/chat/AiMedicalAssistantMiniChat.jsx";

function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <NotificationDrawer />
      <AiMedicalAssistantMiniChat />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AuthProvider>
          <NotificationInitializer />

          <Routes>
            {/* Admin Routes - No Header/Footer */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />
            <Route path="/admin/verify-email/:token" element={<AdminVerifyEmailPage />} />

            {/* User Routes - With Header/Footer */}
            <Route element={<UserLayout />}>
              {/* Public */}
              <Route path="/" element={<KnowledgePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/article/:id" element={<ArticleDetailPage />} />

              {/* Protected */}
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
            </Route>
          </Routes>

          <Toaster position="top-right" />
        </AuthProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}
