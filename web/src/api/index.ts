import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Payments API
export const paymentsApi = {
  getAll: (params?: any) => api.get('/payments', { params }),
  getById: (id: string) => api.get(`/payments/${id}`),
  create: (data: any) => api.post('/payments', data),
  update: (id: string, data: any) => api.put(`/payments/${id}`, data),
  delete: (id: string) => api.delete(`/payments/${id}`),
  search: (criteria: any) => api.get('/payments/search', { params: criteria }),
};

// Audit Events API
export const auditEventsApi = {
  getAll: (params?: any) => api.get('/audit-events', { params }),
  getById: (id: string) => api.get(`/audit-events/${id}`),
  create: (data: any) => api.post('/audit-events', data),
  search: (criteria: any) => api.get('/audit-events/search', { params: criteria }),
};

// Health check
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;