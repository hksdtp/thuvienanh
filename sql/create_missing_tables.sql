-- Create missing tables for Projects, Events, Styles, and Accessories

-- 1. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_type VARCHAR(50), -- residential, commercial, office, etc.
  location VARCHAR(255),
  client_name VARCHAR(255),
  completion_date DATE,
  cover_image_url TEXT,
  cover_image_id VARCHAR(255),
  image_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'planning', -- planning, in_progress, completed, archived
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) DEFAULT 'system',
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);

-- 2. Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50), -- internal, external, training, conference, etc.
  event_date DATE,
  location VARCHAR(255),
  attendees INTEGER,
  cover_image_url TEXT,
  cover_image_id VARCHAR(255),
  image_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) DEFAULT 'system',
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

-- 3. Styles table  
CREATE TABLE IF NOT EXISTS styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  style_type VARCHAR(50), -- modern, classic, minimalist, industrial, etc.
  color_palette TEXT[],
  thumbnail_url TEXT,
  thumbnail_id VARCHAR(255),
  image_count INTEGER DEFAULT 0,
  fabric_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) DEFAULT 'system',
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_styles_slug ON styles(slug);
CREATE INDEX IF NOT EXISTS idx_styles_type ON styles(style_type);
CREATE INDEX IF NOT EXISTS idx_styles_active ON styles(is_active);
CREATE INDEX IF NOT EXISTS idx_styles_created ON styles(created_at DESC);

-- 4. Accessories table
CREATE TABLE IF NOT EXISTS accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- phu-kien-trang-tri, thanh-phu-kien, thanh-ly, etc.
  sku VARCHAR(100),
  price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  thumbnail_id VARCHAR(255),
  image_count INTEGER DEFAULT 0,
  material VARCHAR(100),
  dimensions VARCHAR(255),
  weight DECIMAL(10, 2),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) DEFAULT 'system',
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_accessories_category ON accessories(category);
CREATE INDEX IF NOT EXISTS idx_accessories_sku ON accessories(sku);
CREATE INDEX IF NOT EXISTS idx_accessories_active ON accessories(is_active);
CREATE INDEX IF NOT EXISTS idx_accessories_created ON accessories(created_at DESC);

-- Create update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_styles_updated_at
  BEFORE UPDATE ON styles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accessories_updated_at
  BEFORE UPDATE ON accessories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE projects IS 'Quản lý thông tin công trình';
COMMENT ON TABLE events IS 'Quản lý thông tin sự kiện';
COMMENT ON TABLE styles IS 'Quản lý phong cách thiết kế';
COMMENT ON TABLE accessories IS 'Quản lý phụ kiện rèm cửa';

-- Insert sample data for testing

-- Sample Projects
INSERT INTO projects (name, description, project_type, location, client_name, status, tags) VALUES
('Villa Thảo Điền', 'Biệt thự cao cấp với thiết kế hiện đại', 'residential', 'Thảo Điền, Q2', 'Anh Minh', 'completed', ARRAY['biệt thự', 'cao cấp', 'hiện đại']),
('Văn phòng Bitexco', 'Thiết kế nội thất văn phòng 500m2', 'office', 'Bitexco Tower', 'Công ty ABC', 'in_progress', ARRAY['văn phòng', 'hiện đại']),
('Căn hộ Vinhomes', 'Căn hộ 3PN phong cách minimalist', 'residential', 'Vinhomes Central Park', 'Chị Lan', 'completed', ARRAY['căn hộ', 'minimalist'])
ON CONFLICT DO NOTHING;

-- Sample Events  
INSERT INTO events (name, description, event_type, event_date, location, attendees, tags) VALUES
('Team Building 2024', 'Hoạt động team building thường niên', 'internal', '2024-07-15', 'Vũng Tàu', 50, ARRAY['team building', 'nội bộ']),
('Khai trương Showroom', 'Lễ khai trương showroom mới', 'external', '2024-06-01', 'Q1, HCM', 200, ARRAY['khai trương', 'showroom']),
('Đào tạo sản phẩm mới', 'Training về các sản phẩm mới Q3', 'training', '2024-08-10', 'Văn phòng', 30, ARRAY['đào tạo', 'sản phẩm'])
ON CONFLICT DO NOTHING;

-- Sample Styles
INSERT INTO styles (name, slug, description, style_type, color_palette, tags) VALUES
('Modern Minimalist', 'modern-minimalist', 'Phong cách tối giản hiện đại', 'modern', ARRAY['#FFFFFF', '#000000', '#808080'], ARRAY['modern', 'minimalist']),
('Classic Luxury', 'classic-luxury', 'Phong cách cổ điển sang trọng', 'classic', ARRAY['#D4AF37', '#8B4513', '#FFFFFF'], ARRAY['classic', 'luxury']),
('Industrial Chic', 'industrial-chic', 'Phong cách công nghiệp', 'industrial', ARRAY['#333333', '#666666', '#CC6633'], ARRAY['industrial', 'chic'])
ON CONFLICT DO NOTHING;

-- Sample Accessories
INSERT INTO accessories (name, description, category, sku, price, stock_quantity, material, tags) VALUES
('Móc rèm inox 304', 'Móc rèm cao cấp chống gỉ', 'thanh-phu-kien', 'MR-304-01', 25000, 100, 'Inox 304', ARRAY['móc rèm', 'inox']),
('Tua rua trang trí', 'Tua rua trang trí màu vàng', 'phu-kien-trang-tri', 'TR-GOLD-01', 150000, 50, 'Polyester', ARRAY['tua rua', 'trang trí']),
('Thanh ray nhôm', 'Thanh ray trượt êm', 'thanh-phu-kien', 'RAY-ALU-200', 450000, 30, 'Nhôm', ARRAY['thanh ray', 'nhôm'])
ON CONFLICT DO NOTHING;

-- Show created tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('projects', 'events', 'styles', 'accessories')
ORDER BY table_name;
