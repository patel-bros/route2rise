import axios from 'axios';

// Allow backend URL to be configured via Vite env (fallback to local dev)
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').trim();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
 
export { API_BASE_URL };
export default api;
