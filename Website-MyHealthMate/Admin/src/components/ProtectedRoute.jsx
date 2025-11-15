import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // user is not authenticated
    return <Navigate to="/login" />;
  }
  return children;
}
