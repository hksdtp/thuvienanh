/**
 * Database Types
 * Copy từ web app types/database.ts
 */

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Fabric (Vải)
export interface Fabric {
  id: string
  name: string
  code: string
  description?: string
  material: string
  width?: number
  weight?: number
  color: string
  pattern?: string
  finish?: string
  origin?: string
  price_per_meter?: number
  stock_quantity?: number
  min_order_quantity?: number
  primary_image_url?: string
  tags?: string[]
  search_keywords?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  image_count?: number
}

export interface FabricFilter {
  search?: string
  material?: string[]
  color?: string[]
  pattern?: string[]
  price_range?: {
    min?: number
    max?: number
  }
  in_stock?: boolean
}

// Album
export interface Album {
  id: string
  name: string
  description?: string
  cover_image_url?: string
  cover_image_id?: string
  image_count: number
  created_at: string
  updated_at: string
  created_by?: string
  is_active: boolean
  tags?: string[]
}

// Project
export interface Project {
  id: string
  name: string
  description?: string
  project_type?: string
  location?: string
  client_name?: string
  completion_date?: string
  cover_image_url?: string
  cover_image_id?: string
  image_count: number
  created_at: string
  updated_at: string
  created_by?: string
  is_active: boolean
  tags?: string[]
  status?: string
  is_featured?: boolean
}

// Collection
export interface Collection {
  id: string
  name: string
  description?: string
  cover_image_url?: string
  fabric_count: number
  created_at: string
  updated_at: string
  created_by?: string
  is_active: boolean
}

// Event
export interface Event {
  id: string
  name: string
  description?: string
  event_type?: string
  event_date?: string
  location?: string
  organizer?: string
  attendees_count?: number
  cover_image_url?: string
  cover_image_id?: string
  image_count: number
  created_at: string
  updated_at: string
  created_by?: string
  is_active: boolean
  tags?: string[]
  status?: string
}

// Image
export interface Image {
  id: string
  url: string
  thumbnail_url?: string
  filename: string
  file_size?: number
  width?: number
  height?: number
  mime_type?: string
  uploaded_at: string
  uploaded_by?: string
}

