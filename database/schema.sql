-- Thư Viện Ảnh VẢI - Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Collections table
CREATE TABLE collections (
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
CREATE TABLE fabrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  
  -- Technical specs
  material VARCHAR(100) NOT NULL,
  width INTEGER NOT NULL,
  weight INTEGER NOT NULL,
  color VARCHAR(100) NOT NULL,
  pattern VARCHAR(100),
  finish VARCHAR(100),
  origin VARCHAR(100),
  
  -- Pricing and inventory
  price_per_meter DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  
  -- Media
  primary_image_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  search_keywords TEXT
);

-- Collection-Fabric relationship table (many-to-many)
CREATE TABLE collection_fabrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(collection_id, fabric_id)
);

-- Fabric images table (multiple images per fabric)
CREATE TABLE fabric_images (
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

-- Albums table
CREATE TABLE albums (
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

-- Album images table
CREATE TABLE album_images (
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

-- Indexes for performance
CREATE INDEX idx_fabrics_material ON fabrics(material);
CREATE INDEX idx_fabrics_color ON fabrics(color);
CREATE INDEX idx_fabrics_code ON fabrics(code);
CREATE INDEX idx_fabrics_tags ON fabrics USING GIN(tags);
CREATE INDEX idx_fabrics_is_active ON fabrics(is_active);
CREATE INDEX idx_fabrics_created_at ON fabrics(created_at DESC);

CREATE INDEX idx_collections_name ON collections(name);
CREATE INDEX idx_collections_is_active ON collections(is_active);
CREATE INDEX idx_collections_created_at ON collections(created_at DESC);

CREATE INDEX idx_collection_fabrics_collection_id ON collection_fabrics(collection_id);
CREATE INDEX idx_collection_fabrics_fabric_id ON collection_fabrics(fabric_id);
CREATE INDEX idx_collection_fabrics_sort_order ON collection_fabrics(sort_order);

CREATE INDEX idx_fabric_images_fabric_id ON fabric_images(fabric_id);
CREATE INDEX idx_fabric_images_is_primary ON fabric_images(is_primary);
CREATE INDEX idx_fabric_images_sort_order ON fabric_images(sort_order);

CREATE INDEX idx_albums_category ON albums(category);
CREATE INDEX idx_albums_tags ON albums USING GIN(tags);
CREATE INDEX idx_albums_is_active ON albums(is_active);
CREATE INDEX idx_albums_created_at ON albums(created_at DESC);

CREATE INDEX idx_album_images_album_id ON album_images(album_id);
CREATE INDEX idx_album_images_sort_order ON album_images(sort_order);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fabrics_updated_at BEFORE UPDATE ON fabrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View: Collection with fabric count
CREATE VIEW collections_with_stats AS
SELECT 
  c.*,
  COUNT(cf.fabric_id) as fabric_count
FROM collections c
LEFT JOIN collection_fabrics cf ON c.id = cf.collection_id
GROUP BY c.id;

-- View: Albums with image count
CREATE VIEW albums_with_stats AS
SELECT 
  a.*,
  COUNT(ai.id) as image_count
FROM albums a
LEFT JOIN album_images ai ON a.id = ai.album_id
GROUP BY a.id;

-- Comments for documentation
COMMENT ON TABLE users IS 'System users with role-based access';
COMMENT ON TABLE collections IS 'Fabric collections/categories';
COMMENT ON TABLE fabrics IS 'Main fabric inventory with technical specifications';
COMMENT ON TABLE collection_fabrics IS 'Many-to-many relationship between collections and fabrics';
COMMENT ON TABLE fabric_images IS 'Multiple images for each fabric';
COMMENT ON TABLE albums IS 'Photo albums for organizing fabric images';
COMMENT ON TABLE album_images IS 'Images within albums';
