-- Create image tables for all entities that don't have them yet
-- This ensures consistent image management across all entity types

-- 1. Fabric Images (may already exist)
CREATE TABLE IF NOT EXISTS fabric_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fabric_id UUID NOT NULL REFERENCES fabrics(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_id VARCHAR(255),
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_fabric_images_fabric ON fabric_images(fabric_id);
CREATE INDEX IF NOT EXISTS idx_fabric_images_order ON fabric_images(fabric_id, display_order);

-- 2. Collection Images
CREATE TABLE IF NOT EXISTS collection_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_id VARCHAR(255),
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_collection_images_collection ON collection_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_images_order ON collection_images(collection_id, display_order);

-- 3. Project Images
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  image_id VARCHAR(255),
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_order ON project_images(project_id, display_order);

-- 4. Event Images
CREATE TABLE IF NOT EXISTS event_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  image_id VARCHAR(255),
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_event_images_event ON event_images(event_id);
CREATE INDEX IF NOT EXISTS idx_event_images_order ON event_images(event_id, display_order);

-- 5. Style Images
CREATE TABLE IF NOT EXISTS style_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  image_id VARCHAR(255),
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_style_images_style ON style_images(style_id);
CREATE INDEX IF NOT EXISTS idx_style_images_order ON style_images(style_id, display_order);

-- 6. Accessory Images
CREATE TABLE IF NOT EXISTS accessory_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessory_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  image_id VARCHAR(255),
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_accessory_images_accessory ON accessory_images(accessory_id);
CREATE INDEX IF NOT EXISTS idx_accessory_images_order ON accessory_images(accessory_id, display_order);

-- Add comments
COMMENT ON TABLE fabric_images IS 'Ảnh cho các loại vải';
COMMENT ON TABLE collection_images IS 'Ảnh cho bộ sưu tập';  
COMMENT ON TABLE project_images IS 'Ảnh cho công trình';
COMMENT ON TABLE event_images IS 'Ảnh cho sự kiện';
COMMENT ON TABLE style_images IS 'Ảnh cho phong cách thiết kế';
COMMENT ON TABLE accessory_images IS 'Ảnh cho phụ kiện';

-- Show created tables
SELECT table_name, obj_description(c.oid) as description
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
WHERE table_name LIKE '%_images'
ORDER BY table_name;
