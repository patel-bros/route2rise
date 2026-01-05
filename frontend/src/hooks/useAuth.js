import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const userData = await authService.verify();
          if (userData) {
            setUser(userData);
          } else {
            setUser(null);
            localStorage.removeItem('access_token');
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setUser(null);
        localStorage.removeItem('access_token');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      console.log('useAuth.login called');
      
      const data = await authService.login(username, password);
      console.log('Auth service login returned:', data);
      
      if (!data || !data.access_token) {
        console.error('No access token in response');
        setError('No token received from server');
        return false;
      }
      
      console.log('Setting user to:', { founder: data.founder, authenticated: true });
      setUser({
        founder: data.founder,
        authenticated: true,
      });
      // notify anyone listening immediately
      window.dispatchEvent(new Event('auth-success'));
      
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Login failed';
      console.error('Login error caught in hook:', errorMsg);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return { user, loading, error, login, logout };
};
