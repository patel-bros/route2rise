import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
