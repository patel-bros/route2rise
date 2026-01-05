import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import './styles/global.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    console.log('Checking authentication...');
    if (!authService.isAuthenticated()) {
      console.log('No token found');
      setIsAuthenticated(false);
      return;
    }

    const verified = await authService.verify();
    const authenticated = !!verified;
    console.log('Auth verification result:', authenticated);
    setIsAuthenticated(authenticated);
  };

  useEffect(() => {
    // Initial auth check
    checkAuth().then(() => setLoading(false));

    // Listen for explicit auth success events and storage changes
    const handleAuthSuccess = () => {
      console.log('Auth success event received, setting authenticated');
      setIsAuthenticated(true);
    };
    const handleStorageChange = () => {
      console.log('Storage changed, rechecking auth...');
      checkAuth();
    };

    window.addEventListener('auth-success', handleAuthSuccess);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      // no interval now
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-success', handleAuthSuccess);
    };
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
