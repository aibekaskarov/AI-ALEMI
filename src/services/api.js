// services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== SUBJECTS =====
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// ===== LECTURES =====
export const lecturesAPI = {
  getAll: () => api.get('/lectures'),
  getById: (id) => api.get(`/lectures/${id}`),
  create: (data) => api.post('/lectures', data),
  update: (id, data) => api.put(`/lectures/${id}`, data),
  delete: (id) => api.delete(`/lectures/${id}`),
  generateWithAI: (title, subjectId) => 
    api.post('/ai/lectures', { title, subjectId }),
};

// ===== TESTS =====
export const testsAPI = {
  getAll: () => api.get('/tests'),
  getById: (id) => api.get(`/tests/${id}`),
  create: (data) => api.post('/tests', data),
  update: (id, data) => api.put(`/tests/${id}`, data),
  delete: (id) => api.delete(`/tests/${id}`),
  generateWithAI: (lecture_id, options = {}) => 
    api.post('/ai/tests', { lecture_id, ...options }),
};

// ===== TEACHERS =====
export const teachersAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
};

// ===== SCHEDULES =====
export const schedulesAPI = {
  getAll: () => api.get('/schedules'),
  getById: (id) => api.get(`/schedules/${id}`),
  generateForTeacher: (teacherId) => 
    api.post(`/schedules/generate/${teacherId}`),
  delete: (id) => api.delete(`/schedules/${id}`),
};

export default api;