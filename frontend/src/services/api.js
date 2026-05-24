import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear tokens and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
