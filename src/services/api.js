import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:5190/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT if present
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('art_effect_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — normalize errors from ASP.NET Core
http.interceptors.response.use(
  (res) => res,
  (err) => {
    // If we get a 401 Unauthorized, forcibly log the user out
    if (err.response && err.response.status === 401) {
      console.warn("Session expired. Logging out.");
      localStorage.removeItem('art_effect_token');
      localStorage.removeItem('art_effect_user');
      window.location.href = '/login';
    }

    // Handle both our custom messages and default .NET validation errors
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(msg));
  }
);

export const productService = {
  /** GET /api/Product */
  getAll: () => http.get('/Product'),

  /** GET /api/Product/{id} */
  getById: (id) => http.get(`/Product/${id}`),

  /** POST /api/Product (Multipart/Form-Data) */
  create: (formData) => http.post('/Product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  /** PUT /api/Product/update/{id} */
  update: (id, formData) => http.put(`/Product/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  /** DELETE /api/Product/{id} */
  delete: (id) => http.delete(`/Product/${id}`),
};

export const categoryService = {
  /** GET /api/Category */
  getAll: () => http.get('/Category'),
  
  /** GET /api/Category/{id} */
  getById: (id) => http.get(`/Category/${id}`),

  /** POST /api/Category */
  create: (data) => http.post('/Category', data),
  
  /** PUT /api/Category/{id} */
  update: (id, data) => http.put(`/Category/${id}`, data),
  
  /** DELETE /api/Category/{id} */
  delete: (id) => http.delete(`/Category/${id}`),
};

export const cartService = {
  /** GET /api/Cart/{userId} */
  get: (userId) => http.get(`/Cart/${userId}`),

  /** POST /api/Cart/add/{userId}/{productId}/{quantity} */
  add: (userId, productId, quantity) =>
    http.post(`/Cart/add/${userId}/${productId}/${quantity}`),

  /** PUT /api/Cart/update/{userId}/{productId}/{quantity} */
  update: (userId, productId, quantity) =>
    http.put(`/Cart/update/${userId}/${productId}/${quantity}`),

  /** DELETE /api/Cart/remove/{userId}/{productId} */
  remove: (userId, productId) =>
    http.delete(`/Cart/remove/${userId}/${productId}`),

  /** DELETE /api/Cart/clear/{userId} */
  clear: (userId) => http.delete(`/Cart/clear/${userId}`),
};

export const authService = {
  /** POST /api/Auth/login */
  login: (email, password) =>
    http.post('/Auth/login', { email, password }),

  /** POST /api/Auth/register */
  register: (data) =>
    http.post('/Auth/register', data), // data: { name, email, phone, address, password }

  /** PUT /api/Auth/update */
  update: (data) => http.put('/Auth/update', data),

  /** GET /api/Auth/profile */
  getProfile: () => http.get('/Auth/profile'),

  /** DELETE /api/Auth/delete */
  deleteAccount: () => http.delete('/Auth/delete'),
};

export const orderService = {
  /** POST /api/Order/checkout/{userId} */
  checkout: (userId, address) => 
    http.post(`/Order/checkout/${userId}`, { address }),

  /** GET /api/Order/history/{userId} */
  getHistory: (userId) => http.get(`/Order/history/${userId}`),

  /** GET /api/Order/details/{orderId} */
  getDetails: (orderId) => http.get(`/Order/details/${orderId}`),

  /** PUT /api/Order/cancel/{orderId}/user/{userId} */
  cancel: (orderId, userId) => 
    http.put(`/Order/cancel/${orderId}/user/${userId}`),
};

