import axios from 'axios';

const getBaseUrl = () => {
    return '/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000,
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
