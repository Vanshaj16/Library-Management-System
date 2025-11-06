import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Helper methods
const apiService = {
  setAuthToken: (token) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  },

  removeAuthToken: () => {
    delete api.defaults.headers.common["Authorization"]
  },

  // Auth endpoints
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),

  // Books endpoints
  getBooks: (params) => api.get("/books", { params }),
  getBook: (id) => api.get(`/books/${id}`),
  createBook: (bookData) => api.post("/books", bookData),
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  deleteBook: (id) => api.delete(`/books/${id}`),

  // Users endpoints
  getUsers: (params) => api.get("/users", { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Transactions endpoints
  getTransactions: (params) => api.get("/transactions", { params }),
  createTransaction: (transactionData) => api.post("/transactions", transactionData),
  updateTransaction: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),

  // Custom endpoints
  getBorrowedBooks: (userId) => api.get(`/transactions/user/${userId}/borrowed`),
  returnBook: (transactionId) => api.put(`/transactions/${transactionId}/return`),

  // Dashboard endpoints
  getDashboardStats: () => api.get("/dashboard/stats"),
  getRecentBooks: (params) => api.get("/dashboard/recent-books", { params }),
  getRecentTransactions: (params) => api.get("/dashboard/recent-transactions", { params }),

  // Generic methods
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
}

export default apiService
