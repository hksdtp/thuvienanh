/**
 * Albums API Service
 * API calls cho Albums
 */

import { api } from './api'
import { ApiResponse, Album } from '../types/database'

export const albumsApi = {
  /**
   * Lấy danh sách tất cả albums
   */
  getAll: async (): Promise<ApiResponse<Album[]>> => {
    return api.get<ApiResponse<Album[]>>('/api/albums')
  },

  /**
   * Lấy chi tiết album theo ID
   */
  getById: async (id: string): Promise<ApiResponse<Album>> => {
    return api.get<ApiResponse<Album>>(`/api/albums/by-id/${id}`)
  },

  /**
   * Tạo album mới
   */
  create: async (data: { name: string; description?: string }): Promise<ApiResponse<Album>> => {
    return api.post<ApiResponse<Album>>('/api/albums', data)
  },

  /**
   * Cập nhật album
   */
  update: async (id: string, data: Partial<Album>): Promise<ApiResponse<Album>> => {
    return api.put<ApiResponse<Album>>(`/api/albums/by-id/${id}`, data)
  },

  /**
   * Xóa album
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<ApiResponse<void>>(`/api/albums/by-id/${id}`)
  },

  /**
   * Lấy danh sách ảnh trong album
   */
  getImages: async (id: string): Promise<ApiResponse<any[]>> => {
    return api.get<ApiResponse<any[]>>(`/api/albums/by-id/${id}/images`)
  },

  /**
   * Thêm ảnh vào album
   */
  addImage: async (id: string, formData: FormData): Promise<ApiResponse<any>> => {
    return api.post<ApiResponse<any>>(`/api/albums/by-id/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

