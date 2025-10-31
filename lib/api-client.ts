// API Client for Frontend (Vercel)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || 'API Error')
  }
  
  return response.json()
}

// Fabrics API
export const fabricsApi = {
  getAll: (filters?: any) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'min_order_quantity' && typeof value === 'object') {
            const moqValue = value as { min?: number; max?: number }
            if (moqValue.min !== undefined) params.append('min_moq', moqValue.min.toString())
            if (moqValue.max !== undefined) params.append('max_moq', moqValue.max.toString())
          } else if (key === 'price_range' && typeof value === 'object') {
            const priceValue = value as { min?: number; max?: number }
            if (priceValue.min !== undefined) params.append('min_price', priceValue.min.toString())
            if (priceValue.max !== undefined) params.append('max_price', priceValue.max.toString())
          } else if (Array.isArray(value)) {
            params.append(key, value.join(','))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }
    const queryString = params.toString()
    return apiFetch<any[]>(`/api/fabrics${queryString ? `?${queryString}` : ''}`)
  },
  getById: (id: string) => apiFetch<any>(`/api/fabrics/${id}`),
  create: (data: any) => apiFetch<any>('/api/fabrics', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiFetch<any>(`/api/fabrics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiFetch<void>(`/api/fabrics/${id}`, {
    method: 'DELETE',
  }),
}

// Projects API
export const projectsApi = {
  getAll: () => apiFetch<any[]>('/api/projects'),
  getById: (id: string) => apiFetch<any>(`/api/projects/${id}`),
}

// Collections API
export const collectionsApi = {
  getAll: () => apiFetch<any[]>('/api/collections'),
  getById: (id: string) => apiFetch<any>(`/api/collections/${id}`),
}

// Albums API
export const albumsApi = {
  getAll: () => apiFetch<any[]>('/api/albums'),
  getById: (id: string) => apiFetch<any>(`/api/albums/${id}`),
}
