import api from './api';

export const authService = {
  login: async (username, password) => {
    try {
      console.log('Sending login request to:', process.env.NODE_ENV === 'production' ? 'https://api.route2rise.com' : 'http://localhost:8000');
      const response = await api.post('/auth/login', { username, password });
      console.log('Login response:', response.data);
      
      if (response.data && response.data.access_token) {
        console.log('Token received:', response.data.access_token.substring(0, 20) + '...');
        localStorage.setItem('access_token', response.data.access_token);
        // founder is already a string from API
        localStorage.setItem('founder', response.data.founder);
        console.log('Token stored in localStorage');
        // Notify app about auth change
        window.dispatchEvent(new Event('auth-success'));
      }
      return response.data;
    } catch (error) {
      console.error('Login API error:', error.message);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('founder');
  },

  verify: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Verify error:', error);
      localStorage.removeItem('access_token');
      return null;
    }
  },

  getCurrentUser: () => {
    return {
      founder: localStorage.getItem('founder'),
      token: localStorage.getItem('access_token'),
    };
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};
