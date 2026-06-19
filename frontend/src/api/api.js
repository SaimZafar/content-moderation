import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

// Submissions
export const createSubmission = (formData) => API.post('/submissions', formData);
export const getMySubmissions = (params) => API.get('/submissions', { params });

// Appeals
export const createAppeal = (data) => API.post('/appeals', data);
export const getMyAppeals = () => API.get('/appeals');

// Admin
export const getAppealsQueue = () => API.get('/admin/appeals');
export const resolveAppeal = (id, data) => API.put(`/admin/appeals/${id}`, data);
export const getPolicies = () => API.get('/admin/policies');
export const updatePolicy = (id, data) => API.put(`/admin/policies/${id}`, data);
export const getAnalytics = () => API.get('/admin/analytics');