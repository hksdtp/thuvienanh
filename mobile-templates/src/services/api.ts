/**
 * API Client
 * Kết nối với Next.js backend API
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { API_CONFIG } from '../constants/config'

// Tạo axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Log request trong dev mode
    if (__DEV__) {
      console.log('🌐 API Request:', config.method?.toUpperCase(), config.url)
    }
    
    // Thêm auth token nếu có
    // const token = await getAuthToken()
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response trong dev mode
    if (__DEV__) {
      console.log('✅ API Response:', response.config.url, response.status)
    }
    
    // Trả về data từ response
    return response.data
  },
  (error) => {
    // Log error
    console.error('❌ API Error:', error.response?.status, error.config?.url)
    
    // Handle specific error codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.log('🔒 Unauthorized - need to login')
          break
        case 403:
          // Forbidden
          console.log('🚫 Forbidden - no permission')
          break
        case 404:
          // Not found
          console.log('🔍 Not found')
          break
        case 500:
          // Server error
          console.log('💥 Server error')
          break
      }
    }
    
    return Promise.reject(error)
  }
)

// Generic API request function
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.request<T>(config)
    return response as T
  } catch (error) {
    throw error
  }
}

// Helper functions
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
    
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
}

