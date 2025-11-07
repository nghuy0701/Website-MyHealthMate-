/**
 * API Configuration and HTTP Client
 * Handles all API calls to Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

/**
 * HTTP Client with credentials support (for session cookies)
 */
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important: Send cookies with requests
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

const api = new ApiClient(API_BASE_URL)

// Auth APIs
export const authAPI = {
  // User
  registerUser: (data) => api.post('/users/register', data),
  loginUser: (data) => api.post('/users/login', data),
  logoutUser: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/me'),

  // Admin
  registerAdmin: (data) => api.post('/admin/register', data),
  loginAdmin: (data) => api.post('/admin/login', data),
  logoutAdmin: () => api.post('/admin/logout'),
}

// User APIs
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (id, data) => api.put(`/users/${id}`, data),
  getAllUsers: () => api.get('/users'), // Admin only
  getUserById: (id) => api.get(`/users/${id}`), // Admin only
  deleteUser: (id) => api.delete(`/users/${id}`), // Admin only
}

// Patient APIs
export const patientAPI = {
  create: (data) => api.post('/patients', data),
  getMyPatients: () => api.get('/patients/my-patients'),
  getAllPatients: () => api.get('/patients'), // Admin only
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
}

// Prediction APIs
export const predictionAPI = {
  create: (data) => api.post('/predictions', data),
  getMyPredictions: () => api.get('/predictions/my-predictions'),
  getPredictionsByPatient: (patientId) => api.get(`/predictions/patient/${patientId}`),
  getAllPredictions: () => api.get('/predictions'), // Admin only
  getById: (id) => api.get(`/predictions/${id}`),
  update: (id, data) => api.put(`/predictions/${id}`, data),
  delete: (id) => api.delete(`/predictions/${id}`),
  getStatistics: () => api.get('/predictions/statistics'),
}

// Admin APIs
export const adminAPI = {
  getAllAdmins: () => api.get('/admin'),
  getAdminById: (id) => api.get(`/admin/${id}`),
  updateAdmin: (id, data) => api.put(`/admin/${id}`, data),
  deleteAdmin: (id) => api.delete(`/admin/${id}`),
}

export default api
