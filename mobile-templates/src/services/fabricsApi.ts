/**
 * Fabrics API Service
 * API calls cho Fabrics (Vải)
 */

import { api } from './api'
import { ApiResponse, Fabric, FabricFilter } from '../types/database'

export const fabricsApi = {
  /**
   * Lấy danh sách tất cả fabrics
   */
  getAll: async (filters?: FabricFilter): Promise<ApiResponse<Fabric[]>> => {
    const params = new URLSearchParams()
    
    if (filters) {
      // Search
      if (filters.search) {
        params.append('search', filters.search)
      }
      
      // Material
      if (filters.material && filters.material.length > 0) {
        params.append('material', filters.material.join(','))
      }
      
      // Color
      if (filters.color && filters.color.length > 0) {
        params.append('color', filters.color.join(','))
      }
      
      // Pattern
      if (filters.pattern && filters.pattern.length > 0) {
        params.append('pattern', filters.pattern.join(','))
      }
      
      // Price range
      if (filters.price_range) {
        if (filters.price_range.min !== undefined) {
          params.append('min_price', filters.price_range.min.toString())
        }
        if (filters.price_range.max !== undefined) {
          params.append('max_price', filters.price_range.max.toString())
        }
      }
      
      // In stock
      if (filters.in_stock !== undefined) {
        params.append('in_stock', filters.in_stock.toString())
      }
    }
    
    const queryString = params.toString()
    const url = `/api/fabrics${queryString ? `?${queryString}` : ''}`
    
    return api.get<ApiResponse<Fabric[]>>(url)
  },

  /**
   * Lấy chi tiết fabric theo ID
   */
  getById: async (id: string): Promise<ApiResponse<Fabric>> => {
    return api.get<ApiResponse<Fabric>>(`/api/fabrics/${id}`)
  },

  /**
   * Tạo fabric mới
   */
  create: async (formData: FormData): Promise<ApiResponse<Fabric>> => {
    return api.post<ApiResponse<Fabric>>('/api/fabrics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Cập nhật fabric
   */
  update: async (id: string, data: Partial<Fabric>): Promise<ApiResponse<Fabric>> => {
    return api.put<ApiResponse<Fabric>>(`/api/fabrics/${id}`, data)
  },

  /**
   * Xóa fabric
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/api/fabrics/${id}`)
  },

  /**
   * Lấy danh sách ảnh của fabric
   */
  getImages: async (id: string): Promise<ApiResponse<any[]>> => {
    return api.get<ApiResponse<any[]>>(`/api/fabrics/${id}/images`)
  },

  /**
   * Thêm ảnh vào fabric
   */
  addImage: async (id: string, formData: FormData): Promise<ApiResponse<any>> => {
    return api.post<ApiResponse<any>>(`/api/fabrics/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

