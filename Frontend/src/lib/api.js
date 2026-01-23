/**
 * API Client for MyHealthMate Backend
 * Handles all HTTP requests with session-based authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8017/api/v1'

/**
 * HTTP Client with credentials support (session cookies)
 */
class ApiClient {
  async request(endpoint, options = {}) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Critical for session cookies
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Request failed')
      }

      return data
    } catch (error) {
      throw error
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

const apiClient = new ApiClient()

// ============================================================================
// Authentication APIs
// ============================================================================
export const authAPI = {
  registerUser: (userData) => apiClient.post('/users/register', userData),
  loginUser: (credentials) => apiClient.post('/users/login', credentials),
  logoutUser: () => apiClient.post('/users/logout'),
}

// ============================================================================
// User APIs
// ============================================================================
export const userAPI = {
  getMe: () => apiClient.get('/users/me'),
  updateMe: (data) => apiClient.put('/users/me', data),
  changePassword: (data) => apiClient.put('/users/change-password', data),
  getAllUsers: () => apiClient.get('/users'), // Admin only
  getUserById: (id) => apiClient.get(`/users/${id}`), // Admin only
  deleteUser: (id) => apiClient.delete(`/users/${id}`), // Admin only
}

// ============================================================================
// Patient APIs
// ============================================================================
export const patientAPI = {
  create: (data) => apiClient.post('/patients', data),
  getMyPatients: () => apiClient.get('/patients/my-patients'),
  getAllPatients: () => apiClient.get('/patients'), // Admin only
  getById: (id) => apiClient.get(`/patients/${id}`),
  update: (id, data) => apiClient.put(`/patients/${id}`, data),
  delete: (id) => apiClient.delete(`/patients/${id}`),
}

// ============================================================================
// Prediction APIs
// ============================================================================
export const predictionAPI = {
  create: (data) => apiClient.post('/predictions', data),
  getMyPredictions: () => apiClient.get('/predictions/my-predictions'),
  getPredictionsByPatient: (patientId) => apiClient.get(`/predictions/patient/${patientId}`),
  getAllPredictions: () => apiClient.get('/predictions'), // Admin only
  getById: (id) => apiClient.get(`/predictions/${id}`),
  delete: (id) => apiClient.delete(`/predictions/${id}`),
  getStatistics: () => apiClient.get('/predictions/statistics'),
}

// ============================================================================
// ML Service APIs
// ============================================================================
export const mlAPI = {
  predict: (data) => apiClient.post('/ml/predict', data),
  getModelInfo: () => apiClient.get('/ml/model-info'),
}

// ============================================================================
// Admin APIs
// ============================================================================
export const adminAPI = {
  getDashboardStats: () => apiClient.get('/admin/dashboard'),
  getAllUsers: () => apiClient.get('/admin/users'),
  getUserDetails: (id) => apiClient.get(`/admin/users/${id}`),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
}

// ============================================================================
// Article APIs
// ============================================================================
export const articleAPI = {
  getAll: () => apiClient.get('/articles'),
  getById: (id) => apiClient.get(`/articles/${id}`),
  create: (data) => apiClient.post('/articles', data), // Admin only
  update: (id, data) => apiClient.put(`/articles/${id}`, data), // Admin only
  delete: (id) => apiClient.delete(`/articles/${id}`), // Admin only
}

// ============================================================================
// Question APIs
// ============================================================================
export const questionAPI = {
  getAll: () => apiClient.get('/questions'),
  getById: (id) => apiClient.get(`/questions/${id}`),
  create: (data) => apiClient.post('/questions', data), // Admin only
  update: (id, data) => apiClient.put(`/questions/${id}`, data), // Admin only
  delete: (id) => apiClient.delete(`/questions/${id}`), // Admin only
}

// ============================================================================
// Chat APIs
// ============================================================================
export const chatAPI = {
  // Send message (patient or doctor)
  sendMessage: (data) => apiClient.post('/chat/messages', data),
  
  // Get doctor's inbox (conversations with patients)
  getDoctorInbox: () => apiClient.get('/chat/conversations/doctor'),
  
  // Get patient's conversation info
  getPatientConversation: () => apiClient.get('/chat/conversations/patient'),
  
  // Get messages in a conversation
  getMessages: (conversationId) => apiClient.get(`/chat/messages/${conversationId}`),
  
  // Mark messages as read
  markAsRead: (conversationId) => apiClient.put(`/chat/messages/${conversationId}/read`),
}
