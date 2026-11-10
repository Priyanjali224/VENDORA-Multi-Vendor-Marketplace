import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Interceptor to attach JWT token to all outgoing requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('vendora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to gracefully handle auth expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('vendora_token')) {
        localStorage.removeItem('vendora_token');
        localStorage.removeItem('vendora_user');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
