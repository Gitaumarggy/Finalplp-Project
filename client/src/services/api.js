import axios from 'axios';

// Force localhost for development
const API_BASE_URL = 'http://localhost:5000/api';

// Debug: Log the base URL to see what's being used
console.log('Using API Base URL:', API_BASE_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});     

export default API;

