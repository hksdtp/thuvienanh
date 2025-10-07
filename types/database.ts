// Database Types và Interfaces cho Hệ thống Quản lý Vải
// Định nghĩa cấu trúc dữ liệu cho collections, fabrics và các bảng liên quan

export interface Collection {
  id: string
  name: string
  description?: string
  created_at: Date
  updated_at: Date
  created_by: string
  is_active: boolean
  fabric_count: number
  thumbnail_url?: string
}

export interface Fabric {
  id: string
  name: string
  code: string // Mã vải duy nhất (ví dụ: F0123)
  description?: string
  
  // Thông tin kỹ thuật
  material: string // Chất liệu (Cotton, Polyester, Linen, etc.)
  width: number // Khổ vải (cm)
  weight: number // Trọng lượng (g/m²)
  color: string // Màu sắc
  pattern?: string // Họa tiết
  finish?: string // Hoàn thiện (Satin, Matte, etc.)
  origin?: string // Xuất xứ
  
  // Giá và tồn kho
  price_per_meter: number
  stock_quantity: number
  min_order_quantity: number
  
  // Hình ảnh và media
  primary_image_url?: string
  image_urls: string[]
  
  // Metadata
  created_at: Date
  updated_at: Date
  created_by: string
  is_active: boolean
  
  // SEO và tìm kiếm
  tags: string[]
  search_keywords?: string
}

export interface CollectionFabric {
  id: string
  collection_id: string
  fabric_id: string
  added_at: Date
  added_by: string
  sort_order: number
  notes?: string
}

export interface FabricImage {
  id: string
  fabric_id: string
  url: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
  file_size: number
  file_type: string
  width: number
  height: number
  uploaded_at: Date
  uploaded_by: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'viewer'
  created_at: Date
  last_login?: Date
  is_active: boolean
}

// Album interfaces
export interface Album {
  id: string
  name: string
  description?: string
  cover_image_url?: string
  cover_image_id?: string
  image_count: number
  created_at: Date
  updated_at: Date
  created_by: string
  is_active: boolean
  tags?: string[]
  category?: 'fabric' | 'accessory' | 'event' | 'collection' | 'project' | 'season' | 'client' | 'other'
}

export interface AlbumImage {
  id: string
  album_id: string
  image_id: string | null
  image_url: string
  caption?: string | null
  display_order: number
  added_at: Date
  added_by: string
}

// Extended image interface for albums
export interface ImageWithAlbums {
  id: string
  url: string
  originalName: string
  fileName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  uploadedAt: Date
  alt?: string
  albums: Album[]
}

// Project interfaces - Quản lý ảnh công trình/dự án
export interface Project {
  id: string
  name: string
  description?: string
  project_type?: 'residential' | 'commercial' | 'office' | 'retail' | 'hospitality' | 'other'
  location?: string
  client_name?: string
  completion_date?: Date
  cover_image_url?: string
  cover_image_id?: string
  image_count: number
  created_at: Date
  updated_at: Date
  created_by: string
  is_active: boolean
  tags?: string[]
  status?: 'planning' | 'in_progress' | 'completed' | 'archived'
}

export interface ProjectImage {
  id: string
  project_id: string
  image_id: string
  image_url: string
  image_name: string
  thumbnail_url?: string | null
  sort_order: number
  caption?: string
  room_type?: string // Phòng khách, phòng ngủ, bếp, etc.
  added_at: Date
  added_by: string
}

// Event interfaces - Quản lý ảnh sự kiện/hoạt động nội bộ công ty
export interface Event {
  id: string
  name: string
  description?: string
  event_type?: 'company_party' | 'team_building' | 'training' | 'conference' | 'award_ceremony' | 'anniversary' | 'other'
  event_date?: Date
  location?: string
  organizer?: string
  attendees_count?: number
  cover_image_url?: string
  cover_image_id?: string
  image_count: number
  created_at: Date
  updated_at: Date
  created_by: string
  is_active: boolean
  tags?: string[]
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

export interface EventImage {
  id: string
  event_id: string
  image_id: string
  image_url: string
  image_name: string
  thumbnail_url?: string | null
  sort_order: number
  caption?: string
  added_at: Date
  added_by: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// Album Form Types
export interface CreateAlbumForm {
  name: string
  description?: string
  category?: Album['category']
  tags?: string[]
}

export interface UpdateAlbumForm extends CreateAlbumForm {
  id: string
  cover_image_url?: string
  cover_image_id?: string
  is_active?: boolean
}

export interface AlbumFilter {
  search?: string
  category?: Album['category']
  tags?: string[]
  created_by?: string
  is_active?: boolean
  date_range?: {
    start: Date
    end: Date
  }
}

// Project Form Types
export interface CreateProjectForm {
  name: string
  description?: string
  project_type?: Project['project_type']
  location?: string
  client_name?: string
  completion_date?: Date
  tags?: string[]
  status?: Project['status']
}

export interface UpdateProjectForm extends CreateProjectForm {
  id: string
  cover_image_id?: string
}

export interface ProjectFilter {
  search?: string
  project_type?: Project['project_type']
  status?: Project['status']
  tags?: string[]
  location?: string
  date_range?: {
    start: Date
    end: Date
  }
}

// Event Form Types
export interface CreateEventForm {
  name: string
  description?: string
  event_type?: Event['event_type']
  event_date?: Date
  location?: string
  organizer?: string
  attendees_count?: number
  tags?: string[]
  status?: Event['status']
}

export interface UpdateEventForm extends CreateEventForm {
  id: string
  cover_image_id?: string
}

export interface EventFilter {
  search?: string
  event_type?: Event['event_type']
  status?: Event['status']
  tags?: string[]
  location?: string
  organizer?: string
  date_range?: {
    start: Date
    end: Date
  }
}

// Form Types cho UI
export interface CreateCollectionForm {
  name: string
  description?: string
}

export interface UpdateCollectionForm extends CreateCollectionForm {
  id: string
}

export interface CreateFabricForm {
  name: string
  code: string
  description?: string
  material: string
  width: number
  weight: number
  color: string
  pattern?: string
  finish?: string
  origin?: string
  price_per_meter: number
  stock_quantity: number
  min_order_quantity: number
  tags: string[]
  search_keywords?: string
}

export interface UpdateFabricForm extends CreateFabricForm {
  id: string
}

export interface FabricFilter {
  material?: string[]
  color?: string[]
  pattern?: string[]
  price_range?: {
    min: number
    max: number
  }
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'
  collection_id?: string
  search?: string
  tags?: string[]
}

export interface CollectionFilter {
  search?: string
  created_by?: string
  is_active?: boolean
  date_range?: {
    start: Date
    end: Date
  }
}

// Constants
export const FABRIC_MATERIALS = [
  'Cotton',
  'Polyester', 
  'Linen',
  'Silk',
  'Wool',
  'Rayon',
  'Nylon',
  'Spandex',
  'Blend'
] as const

export const FABRIC_FINISHES = [
  'Satin',
  'Matte',
  'Glossy',
  'Textured',
  'Smooth'
] as const

export const FABRIC_PATTERNS = [
  'Solid',
  'Striped',
  'Floral',
  'Geometric',
  'Abstract',
  'Paisley',
  'Polka Dot'
] as const

export const USER_ROLES = [
  'admin',
  'manager', 
  'viewer'
] as const

export type FabricMaterial = typeof FABRIC_MATERIALS[number]
export type FabricFinish = typeof FABRIC_FINISHES[number]
export type FabricPattern = typeof FABRIC_PATTERNS[number]
export type UserRole = typeof USER_ROLES[number]

// Database Schema SQL (for reference)
export const DATABASE_SCHEMA = `
-- Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  thumbnail_url TEXT
);

-- Fabrics table  
CREATE TABLE fabrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  material VARCHAR(100) NOT NULL,
  width INTEGER NOT NULL,
  weight INTEGER NOT NULL,
  color VARCHAR(100) NOT NULL,
  pattern VARCHAR(100),
  finish VARCHAR(100),
  origin VARCHAR(100),
  price_per_meter DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  primary_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  search_keywords TEXT
);

-- Collection-Fabric relationship table
CREATE TABLE collection_fabrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  added_by UUID REFERENCES users(id),
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(collection_id, fabric_id)
);

-- Fabric images table
CREATE TABLE fabric_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  file_size INTEGER,
  file_type VARCHAR(50),
  width INTEGER,
  height INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX idx_fabrics_material ON fabrics(material);
CREATE INDEX idx_fabrics_color ON fabrics(color);
CREATE INDEX idx_fabrics_code ON fabrics(code);
CREATE INDEX idx_fabrics_tags ON fabrics USING GIN(tags);
CREATE INDEX idx_collections_name ON collections(name);
CREATE INDEX idx_collection_fabrics_collection_id ON collection_fabrics(collection_id);
CREATE INDEX idx_collection_fabrics_fabric_id ON collection_fabrics(fabric_id);
CREATE INDEX idx_fabric_images_fabric_id ON fabric_images(fabric_id);
`;

// Export calculateStockStatus function
export function calculateStockStatus(quantity: number, minOrder: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity === 0) return 'out_of_stock'
  if (quantity <= minOrder * 5) return 'low_stock'
  return 'in_stock'
}

// Utility functions
export function generateFabricCode(): string {
  const prefix = 'F'
  const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `${prefix}${number}`
}
