-- Project Fabrics Junction Table
-- Liên kết giữa Projects và Fabrics (many-to-many)
-- NOTE: Bảng này sẽ hoạt động khi có bảng fabrics trong database

CREATE TABLE IF NOT EXISTS project_fabrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  fabric_id UUID, -- Tạm thời không có foreign key vì chưa có bảng fabrics
  fabric_code VARCHAR(100), -- Mã vải (tạm thời lưu text)
  fabric_name VARCHAR(255), -- Tên vải (tạm thời lưu text)
  quantity DECIMAL(10,2), -- Số lượng vải sử dụng (mét)
  room_type VARCHAR(100), -- Phòng nào sử dụng (phòng khách, phòng ngủ, bếp, phòng tắm...)
  notes TEXT, -- Ghi chú thêm
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) DEFAULT 'system'
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_fabrics_project ON project_fabrics(project_id);
CREATE INDEX IF NOT EXISTS idx_project_fabrics_fabric ON project_fabrics(fabric_id);
CREATE INDEX IF NOT EXISTS idx_project_fabrics_room ON project_fabrics(room_type);

-- Comments
COMMENT ON TABLE project_fabrics IS 'Bảng liên kết giữa công trình và vải sử dụng';
COMMENT ON COLUMN project_fabrics.quantity IS 'Số lượng vải sử dụng (đơn vị: mét)';
COMMENT ON COLUMN project_fabrics.room_type IS 'Loại phòng sử dụng vải: phòng khách, phòng ngủ, bếp, phòng tắm, hành lang, ban công...';

-- Sample data: Thêm vải mẫu vào một số projects
-- Sử dụng fabric_code và fabric_name thay vì fabric_id

-- Project 1: Modern Residence
INSERT INTO project_fabrics (project_id, fabric_code, fabric_name, quantity, room_type, notes)
SELECT
  id as project_id,
  'F001' as fabric_code,
  'Vải Lụa Cao Cấp' as fabric_name,
  15.5 as quantity,
  'Phòng khách' as room_type,
  'Vải lụa mềm mại, sang trọng' as notes
FROM projects
WHERE name = 'Modern Residence'
LIMIT 1;

INSERT INTO project_fabrics (project_id, fabric_code, fabric_name, quantity, room_type, notes)
SELECT
  id as project_id,
  'F002' as fabric_code,
  'Vải Cotton Organic' as fabric_name,
  20.0 as quantity,
  'Phòng ngủ' as room_type,
  'Vải cotton tự nhiên, thân thiện môi trường' as notes
FROM projects
WHERE name = 'Modern Residence'
LIMIT 1;

-- Project 2: Luxury Villa
INSERT INTO project_fabrics (project_id, fabric_code, fabric_name, quantity, room_type, notes)
SELECT
  id as project_id,
  'F003' as fabric_code,
  'Vải Nhung Cao Cấp' as fabric_name,
  30.0 as quantity,
  'Phòng khách' as room_type,
  'Vải nhung sang trọng cho biệt thự' as notes
FROM projects
WHERE name = 'Luxury Villa'
LIMIT 1;

INSERT INTO project_fabrics (project_id, fabric_code, fabric_name, quantity, room_type, notes)
SELECT
  id as project_id,
  'F004' as fabric_code,
  'Vải Linen Cao Cấp' as fabric_name,
  25.0 as quantity,
  'Phòng ngủ chính' as room_type,
  'Vải linen thoáng mát, cao cấp' as notes
FROM projects
WHERE name = 'Luxury Villa'
LIMIT 1;

