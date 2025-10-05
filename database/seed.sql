-- Seed data for development and testing
-- Run this after initial schema setup

\echo 'Starting data seeding...'

-- Insert test users
INSERT INTO users (email, name, role, is_active) VALUES
  ('admin@tva.local', 'Admin User', 'admin', true),
  ('manager@tva.local', 'Manager User', 'manager', true),
  ('user@tva.local', 'Viewer User', 'viewer', true)
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for foreign key references
DO $$
DECLARE
  admin_user_id UUID;
  manager_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin@tva.local';
  SELECT id INTO manager_user_id FROM users WHERE email = 'manager@tva.local';

  -- Insert sample collections
  INSERT INTO collections (id, name, description, created_by, is_active) VALUES
    (uuid_generate_v4(), 'Bộ sưu tập Xuân Hè 2024', 'Các loại vải nhẹ, thoáng mát cho mùa xuân hè', admin_user_id, true),
    (uuid_generate_v4(), 'Vải Cao Cấp', 'Bộ sưu tập vải cao cấp cho thời trang luxury', admin_user_id, true),
    (uuid_generate_v4(), 'Vải Công Sở', 'Các loại vải phù hợp cho trang phục công sở', manager_user_id, true)
  ON CONFLICT DO NOTHING;

  -- Insert sample fabrics
  INSERT INTO fabrics (
    code, name, description, material, width, weight, color, pattern, finish, origin,
    price_per_meter, stock_quantity, min_order_quantity, created_by, is_active,
    tags, search_keywords
  ) VALUES
    (
      'F0123', 'Vải Lụa Cotton F0123', 'Vải lụa cotton cao cấp, mềm mại và thoáng khí',
      'Cotton', 140, 120, 'Trắng ngà', 'Solid', 'Satin', 'Việt Nam',
      45.00, 500, 1, admin_user_id, true,
      ARRAY['cotton', 'luxury', 'breathable'], 'vải lụa cotton cao cấp mềm mại'
    ),
    (
      'P0456', 'Polyester Blend P0456', 'Vải polyester pha trộn, bền đẹp và dễ bảo quản',
      'Polyester', 150, 180, 'Xanh navy', 'Striped', 'Matte', 'Trung Quốc',
      32.00, 300, 2, admin_user_id, true,
      ARRAY['polyester', 'durable', 'easy-care'], 'polyester blend bền đẹp dễ bảo quản'
    ),
    (
      'L0789', 'Linen Tự Nhiên L0789', 'Vải linen 100% tự nhiên, thoáng mát',
      'Linen', 135, 150, 'Be nhạt', 'Solid', 'Natural', 'Việt Nam',
      55.00, 250, 1, manager_user_id, true,
      ARRAY['linen', 'natural', 'summer'], 'linen tự nhiên thoáng mát'
    ),
    (
      'S0234', 'Silk Cao Cấp S0234', 'Vải lụa tơ tằm 100%, mịn màng sang trọng',
      'Silk', 110, 90, 'Đỏ đô', 'Solid', 'Glossy', 'Trung Quốc',
      120.00, 150, 1, admin_user_id, true,
      ARRAY['silk', 'premium', 'luxury'], 'lụa tơ tằm cao cấp sang trọng'
    ),
    (
      'W0567', 'Wool Blend W0567', 'Vải wool pha, ấm áp cho mùa đông',
      'Wool', 145, 250, 'Xám đậm', 'Herringbone', 'Matte', 'Hàn Quốc',
      85.00, 200, 2, manager_user_id, true,
      ARRAY['wool', 'winter', 'warm'], 'wool pha ấm áp mùa đông'
    )
  ON CONFLICT (code) DO NOTHING;

  -- Link fabrics to collections
  INSERT INTO collection_fabrics (collection_id, fabric_id, added_by, sort_order)
  SELECT 
    c.id,
    f.id,
    admin_user_id,
    ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY f.created_at)
  FROM collections c
  CROSS JOIN fabrics f
  WHERE 
    (c.name = 'Bộ sưu tập Xuân Hè 2024' AND f.code IN ('F0123', 'L0789'))
    OR (c.name = 'Vải Cao Cấp' AND f.code IN ('S0234', 'F0123'))
    OR (c.name = 'Vải Công Sở' AND f.code IN ('W0567', 'P0456'))
  ON CONFLICT DO NOTHING;

  -- Insert sample albums
  INSERT INTO albums (name, description, category, tags, created_by, is_active) VALUES
    ('Bộ sưu tập Xuân Hè 2024', 'Các mẫu vải nhẹ nhàng, tươi mát cho mùa xuân hè', 'season', 
     ARRAY['xuân hè', 'nhẹ nhàng', 'tươi mát'], admin_user_id, true),
    ('Vải Công Sở', 'Các loại vải phù hợp cho trang phục công sở', 'project',
     ARRAY['công sở', 'formal', 'chuyên nghiệp'], admin_user_id, true),
    ('Họa Tiết Hình Học', 'Bộ sưu tập vải với các họa tiết hình học hiện đại', 'fabric',
     ARRAY['hình học', 'hiện đại', 'pattern'], manager_user_id, true),
    ('Dự án Khách hàng ABC', 'Các mẫu vải được chọn cho dự án của khách hàng ABC Corp', 'client',
     ARRAY['khách hàng', 'ABC Corp', 'dự án'], admin_user_id, true)
  ON CONFLICT DO NOTHING;

END $$;

\echo 'Sample data seeded successfully!'
\echo '✅ Created:'
\echo '  - 3 users (admin, manager, viewer)'
\echo '  - 3 collections'
\echo '  - 5 fabrics'
\echo '  - 4 albums'
\echo ''
\echo '📧 Login credentials:'
\echo '  Admin: admin@tva.local'
\echo '  Manager: manager@tva.local'
\echo '  Viewer: user@tva.local'
