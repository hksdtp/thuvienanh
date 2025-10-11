-- Fix album_images table structure to match the application code

-- First, backup existing data if any
CREATE TEMP TABLE album_images_backup AS SELECT * FROM album_images;

-- Drop the old table
DROP TABLE IF EXISTS album_images CASCADE;

-- Create the correct table structure
CREATE TABLE album_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_id VARCHAR(255),
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) DEFAULT 'system'
);

-- Create indexes
CREATE INDEX idx_album_images_album ON album_images(album_id);
CREATE INDEX idx_album_images_order ON album_images(album_id, display_order);

-- Migrate data if exists (mapping old columns to new)
INSERT INTO album_images (id, album_id, image_url, image_id, caption, display_order, added_at, added_by)
SELECT 
  id, 
  album_id, 
  image_url, 
  image_id, 
  image_name as caption,  -- map image_name to caption
  COALESCE(sort_order, 0) as display_order,  -- map sort_order to display_order
  COALESCE(added_at, CURRENT_TIMESTAMP) as added_at,
  'system' as added_by  -- convert UUID to string, default to 'system'
FROM album_images_backup
ON CONFLICT DO NOTHING;

-- Drop backup table
DROP TABLE album_images_backup;

-- Add comments
COMMENT ON TABLE album_images IS 'Bảng quản lý ảnh trong albums';
COMMENT ON COLUMN album_images.caption IS 'Mô tả hoặc tên ảnh';
COMMENT ON COLUMN album_images.display_order IS 'Thứ tự hiển thị';

-- Show final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'album_images'
ORDER BY ordinal_position;
