/**
 * useFabrics Hook
 * Custom hook để fetch fabrics data với React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fabricsApi } from '../services/fabricsApi'
import { FabricFilter, Fabric } from '../types/database'

/**
 * Hook để lấy danh sách fabrics
 */
export function useFabrics(filters?: FabricFilter) {
  return useQuery({
    queryKey: ['fabrics', filters],
    queryFn: async () => {
      const response = await fabricsApi.getAll(filters)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch fabrics')
      }
      return response.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook để lấy chi tiết fabric
 */
export function useFabric(id: string) {
  return useQuery({
    queryKey: ['fabric', id],
    queryFn: async () => {
      const response = await fabricsApi.getById(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch fabric')
      }
      return response.data
    },
    enabled: !!id,
  })
}

/**
 * Hook để tạo fabric mới
 */
export function useCreateFabric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => fabricsApi.create(formData),
    onSuccess: () => {
      // Invalidate fabrics list để refetch
      queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    },
  })
}

/**
 * Hook để update fabric
 */
export function useUpdateFabric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Fabric> }) =>
      fabricsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific fabric và fabrics list
      queryClient.invalidateQueries({ queryKey: ['fabric', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    },
  })
}

/**
 * Hook để xóa fabric
 */
export function useDeleteFabric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fabricsApi.delete(id),
    onSuccess: () => {
      // Invalidate fabrics list
      queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    },
  })
}

/**
 * Hook để lấy images của fabric
 */
export function useFabricImages(fabricId: string) {
  return useQuery({
    queryKey: ['fabric-images', fabricId],
    queryFn: async () => {
      const response = await fabricsApi.getImages(fabricId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch fabric images')
      }
      return response.data || []
    },
    enabled: !!fabricId,
  })
}

