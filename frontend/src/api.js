import axios from 'axios';

const getBaseUrl = () => {
    // Return empty string to use the same host/port (relative path)
    // Nginx will proxy /api requests to the backend
    return '/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000, // 10s timeout
});

export default api;
