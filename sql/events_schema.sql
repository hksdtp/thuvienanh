-- Events Table Schema
-- Quản lý ảnh sự kiện/hoạt động nội bộ công ty

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) CHECK (event_type IN ('company_party', 'team_building', 'training', 'conference', 'award_ceremony', 'anniversary', 'other')),
  event_date DATE,
  location VARCHAR(255),
  organizer VARCHAR(255),
  attendees_count INTEGER DEFAULT 0,
  cover_image_url TEXT,
  cover_image_id UUID,
  image_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) NOT NULL DEFAULT 'system',
  is_active BOOLEAN DEFAULT true,
  tags TEXT[], -- Array of tags
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'))
);

-- Event Images table (junction table)
CREATE TABLE IF NOT EXISTS event_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_id UUID,
  image_url TEXT NOT NULL,
  image_name VARCHAR(255),
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  caption TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) NOT NULL DEFAULT 'system'
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_event_images_event_id ON event_images(event_id);
CREATE INDEX IF NOT EXISTS idx_event_images_sort_order ON event_images(event_id, sort_order);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Trigger to update image_count when images are added/removed
CREATE OR REPLACE FUNCTION update_event_image_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events 
    SET image_count = image_count + 1 
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET image_count = GREATEST(0, image_count - 1) 
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_event_image_count_insert
  AFTER INSERT ON event_images
  FOR EACH ROW
  EXECUTE FUNCTION update_event_image_count();

CREATE TRIGGER trigger_update_event_image_count_delete
  AFTER DELETE ON event_images
  FOR EACH ROW
  EXECUTE FUNCTION update_event_image_count();

-- Sample data (10 events)
INSERT INTO events (name, description, event_type, event_date, location, organizer, attendees_count, status, tags) VALUES
('Tiệc Tất Niên 2024', 'Tiệc tất niên công ty chào đón năm mới', 'company_party', '2024-12-20', 'Khách sạn Metropole Hà Nội', 'Phòng Hành Chính', 150, 'completed', ARRAY['celebration', 'year-end', 'party']),
('Team Building Q1 2025', 'Hoạt động team building quý 1', 'team_building', '2025-03-15', 'Sapa, Lào Cai', 'Phòng Nhân Sự', 80, 'completed', ARRAY['teamwork', 'outdoor', 'bonding']),
('Đào Tạo Kỹ Năng Bán Hàng', 'Khóa đào tạo kỹ năng bán hàng cho đội Sales', 'training', '2025-04-10', 'Văn phòng HN', 'Phòng Đào Tạo', 30, 'completed', ARRAY['training', 'sales', 'skills']),
('Hội Nghị Khách Hàng 2025', 'Hội nghị thường niên với khách hàng VIP', 'conference', '2025-05-20', 'JW Marriott Hanoi', 'Phòng Marketing', 200, 'upcoming', ARRAY['conference', 'clients', 'networking']),
('Lễ Trao Giải Nhân Viên Xuất Sắc', 'Vinh danh nhân viên xuất sắc Q1', 'award_ceremony', '2025-04-30', 'Văn phòng HN', 'Ban Giám Đốc', 100, 'upcoming', ARRAY['awards', 'recognition', 'motivation']),
('Kỷ Niệm 10 Năm Thành Lập', 'Lễ kỷ niệm 10 năm thành lập công ty', 'anniversary', '2025-06-15', 'Trung tâm Hội nghị Quốc gia', 'Ban Tổ Chức', 300, 'upcoming', ARRAY['anniversary', 'milestone', 'celebration']),
('Workshop Thiết Kế Nội Thất', 'Workshop về xu hướng thiết kế nội thất 2025', 'training', '2025-03-25', 'Văn phòng HCM', 'Phòng Thiết Kế', 40, 'completed', ARRAY['workshop', 'design', 'trends']),
('Picnic Gia Đình', 'Ngày hội gia đình công ty', 'company_party', '2025-05-01', 'Công viên Thủ Lệ', 'Phòng Nhân Sự', 250, 'upcoming', ARRAY['family', 'outdoor', 'fun']),
('Hội Thảo Công Nghệ AI', 'Hội thảo về ứng dụng AI trong kinh doanh', 'conference', '2025-04-15', 'Văn phòng HN', 'Phòng IT', 60, 'upcoming', ARRAY['technology', 'AI', 'innovation']),
('Sinh Nhật Công Ty Tháng 3', 'Tiệc sinh nhật tập thể tháng 3', 'company_party', '2025-03-28', 'Văn phòng HN', 'Phòng Hành Chính', 50, 'completed', ARRAY['birthday', 'celebration', 'monthly'])
ON CONFLICT DO NOTHING;

-- Add sample cover images
UPDATE events SET cover_image_url = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop' WHERE name = 'Tiệc Tất Niên 2024';
UPDATE events SET cover_image_url = 'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop' WHERE name = 'Team Building Q1 2025';
UPDATE events SET cover_image_url = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop' WHERE name = 'Đào Tạo Kỹ Năng Bán Hàng';
UPDATE events SET cover_image_url = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop' WHERE name = 'Hội Nghị Khách Hàng 2025';
UPDATE events SET cover_image_url = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop' WHERE name = 'Lễ Trao Giải Nhân Viên Xuất Sắc';
UPDATE events SET cover_image_url = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop' WHERE name = 'Kỷ Niệm 10 Năm Thành Lập';
UPDATE events SET cover_image_url = 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop' WHERE name = 'Workshop Thiết Kế Nội Thất';
UPDATE events SET cover_image_url = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop' WHERE name = 'Picnic Gia Đình';
UPDATE events SET cover_image_url = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop' WHERE name = 'Hội Thảo Công Nghệ AI';
UPDATE events SET cover_image_url = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop' WHERE name = 'Sinh Nhật Công Ty Tháng 3';

-- Comments
COMMENT ON TABLE events IS 'Bảng quản lý các sự kiện/hoạt động nội bộ công ty';
COMMENT ON TABLE event_images IS 'Bảng lưu trữ ảnh của các sự kiện';
COMMENT ON COLUMN events.event_type IS 'Loại sự kiện: company_party, team_building, training, conference, award_ceremony, anniversary, other';
COMMENT ON COLUMN events.status IS 'Trạng thái: upcoming, ongoing, completed, cancelled';
COMMENT ON COLUMN events.attendees_count IS 'Số lượng người tham gia';

