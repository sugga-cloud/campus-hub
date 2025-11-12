import axios from 'axios';

// prefer VITE_ prefixed env var (exposed by Vite), fall back to older BACKEND_URL and to localhost
const baseURL = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:8000';

const instance = axios.create({
  baseURL,
  withCredentials: true,  // This is required for cookies to be sent with requests
});

// Attach Authorization header automatically if a token is stored in localStorage
instance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore (e.g., SSR or unavailable localStorage)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;