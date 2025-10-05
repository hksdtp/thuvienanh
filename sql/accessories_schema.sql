-- ============================================
-- ACCESSORIES SCHEMA - PHỤ KIỆN RÈM CỬA
-- ============================================
-- Quản lý phụ kiện rèm cửa với các danh mục:
-- 1. Phụ kiện trang trí
-- 2. Thanh phụ kiện
-- 3. Thanh lý
-- 4. Album
-- ============================================

-- Accessories Categories Table
CREATE TABLE IF NOT EXISTS accessory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO accessory_categories (name, slug, description, sort_order) VALUES
('Phụ kiện trang trí', 'phu-kien-trang-tri', 'Mành rèm, dây buộc rèm, móc cài rèm, đường bo trang trí, viền trang trí, dây tua rua', 1),
('Thanh phụ kiện', 'thanh-phu-kien', 'Các loại thanh treo rèm và phụ kiện liên quan', 2),
('Thanh lý', 'thanh-ly', 'Sản phẩm thanh lý, giảm giá', 3),
('Album', 'album', 'Thư viện ảnh sản phẩm phụ kiện', 4)
ON CONFLICT (slug) DO NOTHING;

-- Accessories Table
CREATE TABLE IF NOT EXISTS accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES accessory_categories(id) ON DELETE RESTRICT,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Product details
  material VARCHAR(100),
  color VARCHAR(100),
  size VARCHAR(100),
  unit VARCHAR(50) DEFAULT 'cái',
  
  -- Pricing
  price DECIMAL(15,2),
  sale_price DECIMAL(15,2),
  discount_percent DECIMAL(5,2),
  is_on_sale BOOLEAN DEFAULT false,
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  
  -- Images
  cover_image_url TEXT,
  cover_image_id VARCHAR(50),
  image_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  specifications JSONB, -- Thông số kỹ thuật chi tiết
  notes TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued', 'clearance')),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100) DEFAULT 'system'
);

-- Accessory Images Table
CREATE TABLE IF NOT EXISTS accessory_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessory_id UUID NOT NULL REFERENCES accessories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_id VARCHAR(50),
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accessories_category ON accessories(category_id);
CREATE INDEX IF NOT EXISTS idx_accessories_code ON accessories(code);
CREATE INDEX IF NOT EXISTS idx_accessories_status ON accessories(status);
CREATE INDEX IF NOT EXISTS idx_accessories_is_active ON accessories(is_active);
CREATE INDEX IF NOT EXISTS idx_accessories_is_featured ON accessories(is_featured);
CREATE INDEX IF NOT EXISTS idx_accessories_tags ON accessories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_accessory_images_accessory_id ON accessory_images(accessory_id);
CREATE INDEX IF NOT EXISTS idx_accessory_images_display_order ON accessory_images(accessory_id, display_order);

-- Trigger: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_accessories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_accessories_updated_at
  BEFORE UPDATE ON accessories
  FOR EACH ROW
  EXECUTE FUNCTION update_accessories_updated_at();

-- Trigger: Auto-update image_count
CREATE OR REPLACE FUNCTION update_accessory_image_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE accessories 
    SET image_count = image_count + 1 
    WHERE id = NEW.accessory_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE accessories 
    SET image_count = GREATEST(0, image_count - 1) 
    WHERE id = OLD.accessory_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_accessory_image_count_insert
  AFTER INSERT ON accessory_images
  FOR EACH ROW
  EXECUTE FUNCTION update_accessory_image_count();

CREATE TRIGGER trigger_update_accessory_image_count_delete
  AFTER DELETE ON accessory_images
  FOR EACH ROW
  EXECUTE FUNCTION update_accessory_image_count();

-- Sample data
INSERT INTO accessories (category_id, code, name, description, price, stock_quantity, tags) 
SELECT 
  c.id,
  'ACC-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
  name_val,
  desc_val,
  price_val,
  stock_val,
  tags_val
FROM accessory_categories c
CROSS JOIN (
  VALUES 
    ('Mành rèm vải cao cấp', 'Mành rèm vải chất lượng cao, nhiều màu sắc', 150000, 50, ARRAY['mành rèm', 'vải', 'trang trí']),
    ('Dây buộc rèm lụa', 'Dây buộc rèm lụa sang trọng', 80000, 100, ARRAY['dây buộc', 'lụa', 'trang trí']),
    ('Móc cài rèm inox', 'Móc cài rèm inox 304 bền đẹp', 25000, 200, ARRAY['móc cài', 'inox', 'phụ kiện']),
    ('Đường bo trang trí', 'Đường bo trang trí viền rèm', 120000, 80, ARRAY['đường bo', 'viền', 'trang trí']),
    ('Dây tua rua', 'Dây tua rua trang trí rèm', 95000, 60, ARRAY['tua rua', 'dây', 'trang trí'])
) AS t(name_val, desc_val, price_val, stock_val, tags_val)
WHERE c.slug = 'phu-kien-trang-tri'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE accessory_categories IS 'Danh mục phụ kiện rèm cửa';
COMMENT ON TABLE accessories IS 'Sản phẩm phụ kiện rèm cửa';
COMMENT ON TABLE accessory_images IS 'Hình ảnh phụ kiện';
COMMENT ON COLUMN accessories.status IS 'Trạng thái: active, inactive, discontinued, clearance';
COMMENT ON COLUMN accessories.specifications IS 'Thông số kỹ thuật dạng JSON';

