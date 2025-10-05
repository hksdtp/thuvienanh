-- ============================================
-- UPDATE PROJECTS CLASSIFICATION
-- ============================================
-- Cập nhật bảng projects để hỗ trợ phân loại mới:
-- 1. Khách hàng lẻ (retail_customer)
-- 2. Dự án (project)
-- 3. Công trình tiêu biểu (featured)
-- ============================================

-- Add new columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_category VARCHAR(50) CHECK (project_category IN ('retail_customer', 'project', 'featured')),
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) CHECK (source_type IN ('technician_report', 'sales_showcase', 'collected')),
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
ADD COLUMN IF NOT EXISTS technician_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS report_date DATE,
ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50) CHECK (customer_type IN ('retail', 'wholesale', 'project', 'vip'));

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(project_category);
CREATE INDEX IF NOT EXISTS idx_projects_source_type ON projects(source_type);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_quality_rating ON projects(quality_rating DESC);
CREATE INDEX IF NOT EXISTS idx_projects_customer_type ON projects(customer_type);

-- Update existing projects to have default values
UPDATE projects 
SET 
  project_category = CASE 
    WHEN project_type = 'residential' THEN 'retail_customer'
    WHEN project_type IN ('commercial', 'office', 'retail', 'hospitality') THEN 'project'
    ELSE 'retail_customer'
  END,
  source_type = 'technician_report',
  customer_type = CASE 
    WHEN project_type = 'residential' THEN 'retail'
    ELSE 'project'
  END
WHERE project_category IS NULL;

-- Add comments
COMMENT ON COLUMN projects.project_category IS 'Phân loại: retail_customer (Khách hàng lẻ), project (Dự án), featured (Công trình tiêu biểu)';
COMMENT ON COLUMN projects.source_type IS 'Nguồn ảnh: technician_report (Báo cáo kỹ thuật), sales_showcase (Ảnh cho sale), collected (Ảnh sưu tầm)';
COMMENT ON COLUMN projects.is_featured IS 'Đánh dấu công trình tiêu biểu (ảnh chất lượng cao)';
COMMENT ON COLUMN projects.quality_rating IS 'Đánh giá chất lượng ảnh (1-5 sao)';
COMMENT ON COLUMN projects.technician_name IS 'Tên kỹ thuật viên báo cáo';
COMMENT ON COLUMN projects.report_date IS 'Ngày báo cáo công trình';
COMMENT ON COLUMN projects.customer_type IS 'Loại khách hàng: retail, wholesale, project, vip';

-- Create view for easy querying
CREATE OR REPLACE VIEW v_projects_by_category AS
SELECT 
  p.*,
  CASE 
    WHEN p.project_category = 'retail_customer' THEN 'Khách hàng lẻ'
    WHEN p.project_category = 'project' THEN 'Dự án'
    WHEN p.project_category = 'featured' THEN 'Công trình tiêu biểu'
  END as category_display_name,
  CASE 
    WHEN p.source_type = 'technician_report' THEN 'Báo cáo kỹ thuật'
    WHEN p.source_type = 'sales_showcase' THEN 'Ảnh cho sale'
    WHEN p.source_type = 'collected' THEN 'Ảnh sưu tầm'
  END as source_display_name
FROM projects p
WHERE p.is_active = true;

-- Create function to mark project as featured
CREATE OR REPLACE FUNCTION mark_project_as_featured(project_uuid UUID, rating INTEGER DEFAULT 5)
RETURNS VOID AS $$
BEGIN
  UPDATE projects
  SET 
    is_featured = true,
    project_category = 'featured',
    quality_rating = rating,
    source_type = 'sales_showcase'
  WHERE id = project_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to get projects by category
CREATE OR REPLACE FUNCTION get_projects_by_category(category VARCHAR(50))
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  description TEXT,
  project_type VARCHAR(50),
  location VARCHAR(255),
  image_count INTEGER,
  quality_rating INTEGER,
  is_featured BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.project_type,
    p.location,
    p.image_count,
    p.quality_rating,
    p.is_featured,
    p.created_at
  FROM projects p
  WHERE p.project_category = category
    AND p.is_active = true
  ORDER BY 
    CASE WHEN p.is_featured THEN 0 ELSE 1 END,
    p.quality_rating DESC NULLS LAST,
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Sample data: Mark some projects as featured
UPDATE projects
SET 
  is_featured = true,
  project_category = 'featured',
  quality_rating = 5,
  source_type = 'sales_showcase'
WHERE name IN ('Modern Residence', 'Luxury Villa', 'Boutique Hotel')
  AND is_active = true;

-- Sample data: Set technician info for retail customers
UPDATE projects
SET
  technician_name = 'Nguyễn Văn A',
  report_date = CURRENT_DATE - INTERVAL '30 days',
  customer_type = 'retail'
WHERE id IN (
  SELECT id FROM projects
  WHERE project_category = 'retail_customer'
    AND technician_name IS NULL
  LIMIT 3
);

-- Sample data: Set project info
UPDATE projects
SET
  technician_name = 'Trần Thị B',
  report_date = CURRENT_DATE - INTERVAL '60 days',
  customer_type = 'project'
WHERE id IN (
  SELECT id FROM projects
  WHERE project_category = 'project'
    AND technician_name IS NULL
  LIMIT 3
);

