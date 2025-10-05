-- Projects Table Schema
-- Quản lý ảnh công trình/dự án

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_type VARCHAR(50) CHECK (project_type IN ('residential', 'commercial', 'office', 'retail', 'hospitality', 'other')),
  location VARCHAR(255),
  client_name VARCHAR(255),
  completion_date DATE,
  cover_image_url TEXT,
  cover_image_id UUID,
  image_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) NOT NULL DEFAULT 'system',
  is_active BOOLEAN DEFAULT true,
  tags TEXT[], -- Array of tags
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'archived'))
);

-- Project Images table (junction table)
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_id UUID,
  image_url TEXT NOT NULL,
  image_name VARCHAR(255),
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  caption TEXT,
  room_type VARCHAR(100), -- Phòng khách, phòng ngủ, bếp, etc.
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) NOT NULL DEFAULT 'system'
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_sort_order ON project_images(project_id, sort_order);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- Trigger to update image_count when images are added/removed
CREATE OR REPLACE FUNCTION update_project_image_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects 
    SET image_count = image_count + 1 
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects 
    SET image_count = GREATEST(0, image_count - 1) 
    WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_image_count_insert
  AFTER INSERT ON project_images
  FOR EACH ROW
  EXECUTE FUNCTION update_project_image_count();

CREATE TRIGGER trigger_update_project_image_count_delete
  AFTER DELETE ON project_images
  FOR EACH ROW
  EXECUTE FUNCTION update_project_image_count();

-- Sample data (8 projects như trong thiết kế)
INSERT INTO projects (name, description, project_type, location, status, tags) VALUES
('Modern Residence', 'Biệt thự hiện đại với thiết kế tối giản', 'residential', 'Hà Nội', 'completed', ARRAY['modern', 'minimalist', 'villa']),
('Urban Office Space', 'Không gian văn phòng đô thị', 'office', 'TP.HCM', 'completed', ARRAY['office', 'urban', 'workspace']),
('Retail Store Design', 'Thiết kế cửa hàng bán lẻ', 'retail', 'Đà Nẵng', 'completed', ARRAY['retail', 'store', 'commercial']),
('Renovated Apartment', 'Căn hộ cải tạo hiện đại', 'residential', 'Hà Nội', 'completed', ARRAY['apartment', 'renovation', 'modern']),
('Luxury Villa', 'Biệt thự cao cấp', 'residential', 'Nha Trang', 'completed', ARRAY['luxury', 'villa', 'resort']),
('Co-working Space', 'Không gian làm việc chung', 'office', 'TP.HCM', 'completed', ARRAY['coworking', 'shared', 'modern']),
('Restaurant Interior', 'Nội thất nhà hàng', 'hospitality', 'Hội An', 'completed', ARRAY['restaurant', 'hospitality', 'interior']),
('Boutique Hotel', 'Khách sạn boutique', 'hospitality', 'Đà Lạt', 'completed', ARRAY['hotel', 'boutique', 'luxury'])
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE projects IS 'Bảng quản lý các dự án/công trình';
COMMENT ON TABLE project_images IS 'Bảng lưu trữ ảnh của các dự án';
COMMENT ON COLUMN projects.project_type IS 'Loại dự án: residential, commercial, office, retail, hospitality, other';
COMMENT ON COLUMN projects.status IS 'Trạng thái: planning, in_progress, completed, archived';
COMMENT ON COLUMN project_images.room_type IS 'Loại phòng: living room, bedroom, kitchen, bathroom, etc.';

