-- Albums Schema
-- Bảng quản lý albums ảnh (vải, công trình, sự kiện)

-- Drop existing table if exists
DROP TABLE IF EXISTS album_images CASCADE;
DROP TABLE IF EXISTS albums CASCADE;

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  cover_image_id VARCHAR(255),
  category VARCHAR(50), -- 'fabric', 'project', 'event'
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) DEFAULT 'system',
  is_active BOOLEAN DEFAULT true,
  image_count INTEGER DEFAULT 0
);

-- Create album_images table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS album_images (
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
CREATE INDEX IF NOT EXISTS idx_albums_category ON albums(category);
CREATE INDEX IF NOT EXISTS idx_albums_created_at ON albums(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_albums_active ON albums(is_active);
CREATE INDEX IF NOT EXISTS idx_album_images_album ON album_images(album_id);
CREATE INDEX IF NOT EXISTS idx_album_images_order ON album_images(album_id, display_order);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_albums_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW
  EXECUTE FUNCTION update_albums_updated_at();

-- Create trigger to update image_count
CREATE OR REPLACE FUNCTION update_albums_image_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE albums SET image_count = image_count + 1 WHERE id = NEW.album_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE albums SET image_count = image_count - 1 WHERE id = OLD.album_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_albums_image_count_insert
  AFTER INSERT ON album_images
  FOR EACH ROW
  EXECUTE FUNCTION update_albums_image_count();

CREATE TRIGGER trigger_update_albums_image_count_delete
  AFTER DELETE ON album_images
  FOR EACH ROW
  EXECUTE FUNCTION update_albums_image_count();

-- Add comments
COMMENT ON TABLE albums IS 'Bảng quản lý albums ảnh (vải, công trình, sự kiện)';
COMMENT ON TABLE album_images IS 'Bảng quản lý ảnh trong albums';
COMMENT ON COLUMN albums.category IS 'Loại album: fabric (vải), project (công trình), event (sự kiện)';
COMMENT ON COLUMN albums.image_count IS 'Số lượng ảnh trong album (tự động cập nhật)';

-- Sample data
INSERT INTO albums (name, description, category, tags, cover_image_url, cover_image_id) VALUES
('Vải Lụa Cao Cấp 2024', 'Bộ sưu tập vải lụa cao cấp nhập khẩu', 'fabric', ARRAY['lụa', 'cao cấp', '2024'], 'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5448&cache_key="5448_1759473933"&type="unit"&size="xl"', '5448'),
('Vải Cotton Organic', 'Vải cotton hữu cơ thân thiện môi trường', 'fabric', ARRAY['cotton', 'organic', 'eco'], 'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5449&cache_key="5449_1759473933"&type="unit"&size="xl"', '5449'),
('Vải Nhung Sang Trọng', 'Bộ sưu tập vải nhung cao cấp', 'fabric', ARRAY['nhung', 'sang trọng'], 'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5450&cache_key="5450_1759473933"&type="unit"&size="xl"', '5450'),

('Biệt Thự Vinhomes', 'Ảnh thi công biệt thự Vinhomes Grand Park', 'project', ARRAY['biệt thự', 'vinhomes', 'cao cấp'], 'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5451&cache_key="5451_1759473933"&type="unit"&size="xl"', '5451'),
('Căn Hộ Masteri', 'Ảnh thi công căn hộ Masteri Thảo Điền', 'project', ARRAY['căn hộ', 'masteri', 'hiện đại'], 'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5452&cache_key="5452_1759473933"&type="unit"&size="xl"', '5452'),
('Văn Phòng Bitexco', 'Ảnh thi công văn phòng tại Bitexco Tower', 'project', ARRAY['văn phòng', 'bitexco', 'thương mại'], 'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5453&cache_key="5453_1759473933"&type="unit"&size="xl"', '5453'),

('Team Building 2024', 'Ảnh sự kiện team building công ty', 'event', ARRAY['team building', '2024', 'nội bộ'], 'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5454&cache_key="5454_1759473933"&type="unit"&size="xl"', '5454'),
('Tiệc Tất Niên 2023', 'Ảnh tiệc tất niên cuối năm 2023', 'event', ARRAY['tiệc', 'tất niên', '2023'], 'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5455&cache_key="5455_1759473933"&type="unit"&size="xl"', '5455'),
('Đào Tạo Nội Bộ Q1/2024', 'Ảnh khóa đào tạo nội bộ quý 1', 'event', ARRAY['đào tạo', 'nội bộ', '2024'], 'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5456&cache_key="5456_1759473933"&type="unit"&size="xl"', '5456'),
('Khai Trương Showroom', 'Ảnh lễ khai trương showroom mới', 'event', ARRAY['khai trương', 'showroom', 'sự kiện'], 'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5457&cache_key="5457_1759473933"&type="unit"&size="xl"', '5457');

-- Sample album_images data
INSERT INTO album_images (album_id, image_url, image_id, caption, display_order)
SELECT 
  id as album_id,
  'http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=' || (5448 + ROW_NUMBER() OVER ())::text || '&cache_key="' || (5448 + ROW_NUMBER() OVER ())::text || '_1759473933"&type="unit"&size="xl"' as image_url,
  (5448 + ROW_NUMBER() OVER ())::text as image_id,
  'Ảnh mẫu ' || ROW_NUMBER() OVER () as caption,
  ROW_NUMBER() OVER () as display_order
FROM albums
CROSS JOIN generate_series(1, 5)
LIMIT 50;

COMMENT ON TABLE albums IS 'Albums đã được tạo với sample data';

