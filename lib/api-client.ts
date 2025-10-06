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
  getAll: () => apiFetch<any[]>('/api/fabrics'),
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
