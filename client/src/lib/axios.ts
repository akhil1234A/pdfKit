import axios from "axios"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const axiosInstance = axios.create({
  baseURL: API_URL,
})

// Add a request interceptor to add the auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")

        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = "/login"
          return Promise.reject(error)
        }

        // Call the refresh token endpoint
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        })

        // Update tokens in localStorage
        localStorage.setItem("accessToken", response.data.accessToken)
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken)
        }

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")

        toast.error("Your session has expired. Please log in again.")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
