-- ============================================
-- STYLES SCHEMA - PHONG CÁCH THIẾT KẾ RÈM
-- ============================================
-- Quản lý các phong cách thiết kế rèm cửa
-- Mỗi phong cách có ảnh minh họa, hướng dẫn phối màu, v.v.
-- ============================================

-- Styles Table
CREATE TABLE IF NOT EXISTS styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  
  -- Style details
  characteristics TEXT, -- Đặc điểm của phong cách
  color_palette JSONB, -- Bảng màu phù hợp: {"primary": ["#fff", "#000"], "accent": ["#gold"]}
  suitable_rooms TEXT[], -- Phòng phù hợp: ['living_room', 'bedroom', 'office']
  
  -- Design elements
  curtain_types TEXT[], -- Loại rèm phù hợp: ['yếm', 'rèm vải', 'rèm cuốn']
  fabric_recommendations TEXT[], -- Gợi ý loại vải
  accessory_recommendations TEXT[], -- Gợi ý phụ kiện
  
  -- Images
  cover_image_url TEXT,
  cover_image_id VARCHAR(50),
  image_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  popularity_score INTEGER DEFAULT 0, -- Điểm phổ biến
  view_count INTEGER DEFAULT 0,
  
  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100) DEFAULT 'system'
);

-- Style Images Table
CREATE TABLE IF NOT EXISTS style_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_id VARCHAR(50),
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  
  -- Image classification
  image_type VARCHAR(50), -- 'inspiration', 'example', 'color_palette', 'detail'
  room_type VARCHAR(100), -- Loại phòng trong ảnh
  
  -- Metadata
  display_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  source VARCHAR(255), -- Nguồn ảnh (nếu sưu tầm)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Style Categories (for grouping styles)
CREATE TABLE IF NOT EXISTS style_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Style-Category Junction Table (many-to-many)
CREATE TABLE IF NOT EXISTS style_category_mappings (
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES style_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (style_id, category_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_styles_slug ON styles(slug);
CREATE INDEX IF NOT EXISTS idx_styles_is_active ON styles(is_active);
CREATE INDEX IF NOT EXISTS idx_styles_is_featured ON styles(is_featured);
CREATE INDEX IF NOT EXISTS idx_styles_popularity ON styles(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_styles_tags ON styles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_style_images_style_id ON style_images(style_id);
CREATE INDEX IF NOT EXISTS idx_style_images_display_order ON style_images(style_id, display_order);
CREATE INDEX IF NOT EXISTS idx_style_images_type ON style_images(image_type);

-- Trigger: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_styles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_styles_updated_at
  BEFORE UPDATE ON styles
  FOR EACH ROW
  EXECUTE FUNCTION update_styles_updated_at();

-- Trigger: Auto-update image_count
CREATE OR REPLACE FUNCTION update_style_image_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE styles 
    SET image_count = image_count + 1 
    WHERE id = NEW.style_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE styles 
    SET image_count = GREATEST(0, image_count - 1) 
    WHERE id = OLD.style_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_style_image_count_insert
  AFTER INSERT ON style_images
  FOR EACH ROW
  EXECUTE FUNCTION update_style_image_count();

CREATE TRIGGER trigger_update_style_image_count_delete
  AFTER DELETE ON style_images
  FOR EACH ROW
  EXECUTE FUNCTION update_style_image_count();

-- Insert default style categories
INSERT INTO style_categories (name, slug, description, sort_order) VALUES
('Cổ điển', 'co-dien', 'Phong cách cổ điển, sang trọng', 1),
('Hiện đại', 'hien-dai', 'Phong cách hiện đại, tối giản', 2),
('Tân cổ điển', 'tan-co-dien', 'Kết hợp giữa cổ điển và hiện đại', 3),
('Scandinavian', 'scandinavian', 'Phong cách Bắc Âu, tối giản, ấm cúng', 4),
('Industrial', 'industrial', 'Phong cách công nghiệp, mộc mạc', 5),
('Minimalist', 'minimalist', 'Phong cách tối giản, đơn giản', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample styles
INSERT INTO styles (name, slug, description, characteristics, suitable_rooms, curtain_types, tags, is_featured) VALUES
(
  'Phong cách Cổ điển Châu Âu',
  'co-dien-chau-au',
  'Phong cách cổ điển sang trọng với yếm rèm, tua rua, và họa tiết tinh xảo',
  'Đặc trưng bởi yếm rèm phức tạp, dây tua rua, màu sắc đậm, vải nhung hoặc lụa cao cấp',
  ARRAY['living_room', 'dining_room', 'master_bedroom'],
  ARRAY['Yếm rèm', 'Rèm vải dày', 'Rèm lụa'],
  ARRAY['cổ điển', 'sang trọng', 'châu âu', 'yếm rèm'],
  true
),
(
  'Phong cách Hiện đại Tối giản',
  'hien-dai-toi-gian',
  'Thiết kế đơn giản, màu sắc trung tính, đường nét sạch sẽ',
  'Rèm đơn giản, không họa tiết phức tạp, màu trắng/xám/be, vải mỏng nhẹ',
  ARRAY['living_room', 'bedroom', 'office', 'kitchen'],
  ARRAY['Rèm vải mỏng', 'Rèm cuốn', 'Rèm roman'],
  ARRAY['hiện đại', 'tối giản', 'minimalist', 'đơn giản'],
  true
),
(
  'Phong cách Scandinavian',
  'scandinavian',
  'Phong cách Bắc Âu với màu sắc nhẹ nhàng, vải tự nhiên, ánh sáng tự nhiên',
  'Màu trắng, xám nhạt, be, vải lanh, cotton, tối đa hóa ánh sáng tự nhiên',
  ARRAY['living_room', 'bedroom', 'dining_room'],
  ARRAY['Rèm vải lanh', 'Rèm cotton', 'Rèm mỏng'],
  ARRAY['scandinavian', 'bắc âu', 'tự nhiên', 'ấm cúng'],
  true
),
(
  'Phong cách Industrial',
  'industrial',
  'Phong cách công nghiệp với vật liệu thô, màu sắc trung tính',
  'Thanh treo kim loại, vải thô, màu xám/đen/nâu, thiết kế đơn giản',
  ARRAY['living_room', 'office', 'loft'],
  ARRAY['Rèm vải thô', 'Rèm lanh', 'Rèm đơn giản'],
  ARRAY['industrial', 'công nghiệp', 'mộc mạc', 'kim loại'],
  false
),
(
  'Phong cách Tân cổ điển',
  'tan-co-dien',
  'Kết hợp giữa sự sang trọng cổ điển và sự tinh tế hiện đại',
  'Yếm rèm đơn giản hơn, màu sắc nhẹ nhàng, vải cao cấp nhưng không quá cầu kỳ',
  ARRAY['living_room', 'bedroom', 'dining_room'],
  ARRAY['Yếm rèm đơn giản', 'Rèm vải cao cấp', 'Rèm lụa'],
  ARRAY['tân cổ điển', 'sang trọng', 'hiện đại', 'tinh tế'],
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Link styles to categories
INSERT INTO style_category_mappings (style_id, category_id)
SELECT s.id, c.id
FROM styles s
CROSS JOIN style_categories c
WHERE 
  (s.slug = 'co-dien-chau-au' AND c.slug = 'co-dien') OR
  (s.slug = 'hien-dai-toi-gian' AND c.slug = 'hien-dai') OR
  (s.slug = 'scandinavian' AND c.slug = 'scandinavian') OR
  (s.slug = 'industrial' AND c.slug = 'industrial') OR
  (s.slug = 'tan-co-dien' AND c.slug = 'tan-co-dien')
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE styles IS 'Phong cách thiết kế rèm cửa';
COMMENT ON TABLE style_images IS 'Hình ảnh minh họa phong cách';
COMMENT ON TABLE style_categories IS 'Danh mục phong cách';
COMMENT ON COLUMN styles.color_palette IS 'Bảng màu phù hợp dạng JSON';
COMMENT ON COLUMN styles.suitable_rooms IS 'Các loại phòng phù hợp';
COMMENT ON COLUMN style_images.image_type IS 'Loại ảnh: inspiration, example, color_palette, detail';

