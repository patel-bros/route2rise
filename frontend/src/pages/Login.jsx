import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../services/api';
import './Login.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login, error, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username || !password) {
      setLocalError('Please enter both username and password');
      return;
    }

    try {
      console.log('Attempting login with username:', username);
      const success = await login(username, password);
      console.log('Login result:', success);
      console.log('Token in storage:', localStorage.getItem('access_token'));
      
      if (success) {
        console.log('Login successful, navigating to dashboard...');
        // Use setTimeout to ensure state updates propagate
        setTimeout(() => {
          console.log('Now navigating...');
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        console.log('Login returned false. Error:', error);
        setLocalError(error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setLocalError(error || `Login failed. Is the backend running on ${API_BASE_URL}?`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1><span className="title-text">Route2Rise</span></h1>
          <p>Lead Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {(localError || error) && (
            <div className="error-message">
              {localError || error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          
        </div>
      </div>
    </div>
  );
};
