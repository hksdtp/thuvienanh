-- Database initialization script
-- This runs automatically when PostgreSQL container starts for the first time

\echo 'Starting database initialization...'

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\echo 'UUID extension enabled'

-- Create tables (importing from schema.sql would be done separately)
-- For now, we'll include the essential schema here

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  thumbnail_url TEXT
);

-- Fabrics table  
CREATE TABLE IF NOT EXISTS fabrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  search_keywords TEXT
);

-- Collection-Fabric relationship
CREATE TABLE IF NOT EXISTS collection_fabrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(collection_id, fabric_id)
);

-- Fabric images
CREATE TABLE IF NOT EXISTS fabric_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  file_size INTEGER,
  file_type VARCHAR(50),
  width INTEGER,
  height INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Albums
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  cover_image_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  category VARCHAR(50) CHECK (category IN ('fabric', 'collection', 'project', 'season', 'client', 'other'))
);

-- Album images
CREATE TABLE IF NOT EXISTS album_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  image_id VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  image_name VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(album_id, image_id)
);

\echo 'Tables created successfully'

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fabrics_material ON fabrics(material);
CREATE INDEX IF NOT EXISTS idx_fabrics_color ON fabrics(color);
CREATE INDEX IF NOT EXISTS idx_fabrics_code ON fabrics(code);
CREATE INDEX IF NOT EXISTS idx_fabrics_tags ON fabrics USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_fabrics_is_active ON fabrics(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_is_active ON collections(is_active);
CREATE INDEX IF NOT EXISTS idx_albums_is_active ON albums(is_active);
CREATE INDEX IF NOT EXISTS idx_collection_fabrics_collection_id ON collection_fabrics(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_fabrics_fabric_id ON collection_fabrics(fabric_id);
CREATE INDEX IF NOT EXISTS idx_fabric_images_fabric_id ON fabric_images(fabric_id);
CREATE INDEX IF NOT EXISTS idx_album_images_album_id ON album_images(album_id);

\echo 'Indexes created successfully'

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fabrics_updated_at ON fabrics;
CREATE TRIGGER update_fabrics_updated_at BEFORE UPDATE ON fabrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_albums_updated_at ON albums;
CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo 'Triggers created successfully'

-- Insert default admin user
INSERT INTO users (id, email, name, role, is_active)
VALUES 
  (uuid_generate_v4(), 'admin@tva.local', 'Admin User', 'admin', true)
ON CONFLICT (email) DO NOTHING;

\echo 'Default admin user created'

\echo 'Database initialization completed successfully!'
