import axios from 'axios';

// Create Axios instance
// In development, we use the proxy set in next.config.ts, so baseURL is relative/local
// In production, this would point to the real backend URL
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        // Check if we are in the browser
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
                console.warn('API Request without token to protected route:', config.url);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized response received (401)', error.config?.url);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                // Redirect to login instead of reloading to prevent infinite loops
                const pathSegments = window.location.pathname.split('/');
                const locale = pathSegments[1] && ['en', 'fr', 'es', 'zh', 'ha'].includes(pathSegments[1]) ? pathSegments[1] : 'en';
                window.location.href = `/${locale}/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
