-- Sample Data for TVA Fabric Library
-- Dữ liệu mẫu để test và demo

-- ============================================
-- 1. COLLECTIONS (Bộ sưu tập)
-- ============================================

INSERT INTO collections (name, description, created_at, updated_at) VALUES
('Spring Collection 2024', 'Bộ sưu tập xuân hè 2024 với các màu sắc tươi sáng', NOW(), NOW()),
('Summer Breeze', 'Vải mỏng nhẹ cho mùa hè', NOW(), NOW()),
('Autumn Elegance', 'Bộ sưu tập thu đông sang trọng', NOW(), NOW()),
('Winter Warmth', 'Vải dày ấm cho mùa đông', NOW(), NOW()),
('Classic Basics', 'Các loại vải cơ bản thường dùng', NOW(), NOW());

-- ============================================
-- 2. FABRICS (Vải)
-- ============================================

INSERT INTO fabrics (
    name, code, description, color, material,
    width, weight, price_per_meter, stock_quantity,
    origin, created_at, updated_at
) VALUES
-- Cotton fabrics
('Cotton Premium White', 'CTN-001', 'Vải cotton cao cấp màu trắng, mềm mại', 'White', 'Cotton', 150, 200, 85000, 500, 'Vietnam', NOW(), NOW()),
('Cotton Navy Blue', 'CTN-002', 'Vải cotton xanh navy, bền màu', 'Navy Blue', 'Cotton', 150, 200, 85000, 450, 'Vietnam', NOW(), NOW()),
('Cotton Pastel Pink', 'CTN-003', 'Vải cotton hồng pastel nhẹ nhàng', 'Pastel Pink', 'Cotton', 150, 180, 90000, 300, 'Vietnam', NOW(), NOW()),
('Cotton Sky Blue', 'CTN-004', 'Vải cotton xanh da trời tươi mát', 'Sky Blue', 'Cotton', 150, 200, 85000, 400, 'Vietnam', NOW(), NOW()),

-- Linen fabrics
('Linen Natural', 'LIN-001', 'Vải lanh tự nhiên, thoáng mát', 'Natural Beige', 'Linen', 140, 180, 120000, 200, 'Vietnam', NOW(), NOW()),
('Linen White', 'LIN-002', 'Vải lanh trắng tinh khiết', 'White', 'Linen', 140, 180, 120000, 180, 'Vietnam', NOW(), NOW()),
('Linen Olive Green', 'LIN-003', 'Vải lanh xanh olive thanh lịch', 'Olive Green', 'Linen', 140, 190, 125000, 150, 'Vietnam', NOW(), NOW()),

-- Silk fabrics
('Silk Ivory', 'SLK-001', 'Lụa tơ tằm màu ngà cao cấp', 'Ivory', 'Silk', 110, 80, 350000, 100, 'Vietnam', NOW(), NOW()),
('Silk Royal Blue', 'SLK-002', 'Lụa xanh hoàng gia sang trọng', 'Royal Blue', 'Silk', 110, 80, 350000, 80, 'Vietnam', NOW(), NOW()),
('Silk Burgundy', 'SLK-003', 'Lụa đỏ burgundy quý phái', 'Burgundy', 'Silk', 110, 85, 380000, 60, 'Vietnam', NOW(), NOW()),

-- Polyester fabrics
('Polyester Black', 'PLY-001', 'Vải polyester đen, không nhăn', 'Black', 'Polyester', 150, 150, 55000, 800, 'Vietnam', NOW(), NOW()),
('Polyester Gray', 'PLY-002', 'Vải polyester xám trung tính', 'Gray', 'Polyester', 150, 150, 55000, 750, 'Vietnam', NOW(), NOW()),
('Polyester Cream', 'PLY-003', 'Vải polyester kem nhẹ nhàng', 'Cream', 'Polyester', 150, 140, 55000, 600, 'Vietnam', NOW(), NOW()),

-- Wool fabrics
('Wool Charcoal', 'WOL-001', 'Vải len xám than ấm áp', 'Charcoal', 'Wool', 150, 300, 280000, 150, 'Vietnam', NOW(), NOW()),
('Wool Camel', 'WOL-002', 'Vải len màu lạc đà cổ điển', 'Camel', 'Wool', 150, 300, 280000, 120, 'Vietnam', NOW(), NOW()),
('Wool Navy', 'WOL-003', 'Vải len xanh navy thanh lịch', 'Navy', 'Wool', 150, 320, 300000, 100, 'Vietnam', NOW(), NOW()),

-- Denim fabrics
('Denim Classic Blue', 'DNM-001', 'Vải denim xanh cổ điển', 'Classic Blue', 'Cotton Denim', 150, 350, 95000, 400, 'Vietnam', NOW(), NOW()),
('Denim Black', 'DNM-002', 'Vải denim đen bền màu', 'Black', 'Cotton Denim', 150, 350, 95000, 350, 'Vietnam', NOW(), NOW()),
('Denim Light Wash', 'DNM-003', 'Vải denim xanh nhạt vintage', 'Light Blue', 'Cotton Denim', 150, 320, 98000, 300, 'Vietnam', NOW(), NOW()),

-- Chiffon fabrics
('Chiffon Blush', 'CHF-001', 'Vải voan hồng phấn mềm mại', 'Blush Pink', 'Chiffon', 140, 60, 75000, 250, 'Vietnam', NOW(), NOW()),
('Chiffon Mint', 'CHF-002', 'Vải voan xanh mint tươi mát', 'Mint Green', 'Chiffon', 140, 60, 75000, 220, 'Vietnam', NOW(), NOW()),
('Chiffon Lavender', 'CHF-003', 'Vải voan tím lavender nhẹ nhàng', 'Lavender', 'Chiffon', 140, 65, 78000, 200, 'Vietnam', NOW(), NOW());

-- ============================================
-- 3. COLLECTION_FABRICS (Liên kết vải và bộ sưu tập)
-- ============================================

-- Spring Collection 2024
INSERT INTO collection_fabrics (fabric_id, collection_id, added_at)
SELECT f.id, c.id, NOW()
FROM fabrics f, collections c
WHERE c.name = 'Spring Collection 2024'
AND f.code IN ('CTN-003', 'CTN-004', 'CHF-001', 'CHF-002', 'CHF-003', 'LIN-001', 'LIN-002');

-- Summer Breeze
INSERT INTO collection_fabrics (fabric_id, collection_id, added_at)
SELECT f.id, c.id, NOW()
FROM fabrics f, collections c
WHERE c.name = 'Summer Breeze'
AND f.code IN ('LIN-001', 'LIN-002', 'LIN-003', 'CTN-001', 'CTN-004', 'CHF-001', 'CHF-002');

-- Autumn Elegance
INSERT INTO collection_fabrics (fabric_id, collection_id, added_at)
SELECT f.id, c.id, NOW()
FROM fabrics f, collections c
WHERE c.name = 'Autumn Elegance'
AND f.code IN ('SLK-001', 'SLK-002', 'SLK-003', 'WOL-002', 'DNM-001', 'DNM-003');

-- Winter Warmth
INSERT INTO collection_fabrics (fabric_id, collection_id, added_at)
SELECT f.id, c.id, NOW()
FROM fabrics f, collections c
WHERE c.name = 'Winter Warmth'
AND f.code IN ('WOL-001', 'WOL-002', 'WOL-003', 'DNM-001', 'DNM-002');

-- Classic Basics
INSERT INTO collection_fabrics (fabric_id, collection_id, added_at)
SELECT f.id, c.id, NOW()
FROM fabrics f, collections c
WHERE c.name = 'Classic Basics'
AND f.code IN ('CTN-001', 'CTN-002', 'PLY-001', 'PLY-002', 'PLY-003', 'DNM-001', 'DNM-002');

-- ============================================
-- 4. ALBUMS (Albums ảnh)
-- ============================================

INSERT INTO albums (name, description, category, created_at, updated_at) VALUES
('Cotton Collection Photos', 'Hình ảnh các loại vải cotton', 'fabric', NOW(), NOW()),
('Silk Luxury Gallery', 'Bộ sưu tập ảnh lụa cao cấp', 'fabric', NOW(), NOW()),
('Seasonal Fabrics 2024', 'Ảnh vải theo mùa năm 2024', 'season', NOW(), NOW()),
('Product Catalog', 'Catalog sản phẩm chính thức', 'collection', NOW(), NOW()),
('Behind The Scenes', 'Hậu trường sản xuất', 'other', NOW(), NOW());

-- ============================================
-- THỐNG KÊ
-- ============================================

-- Xem tổng số records đã tạo
SELECT
    'Collections' as table_name, COUNT(*) as count FROM collections
UNION ALL
SELECT 'Fabrics', COUNT(*) FROM fabrics
UNION ALL
SELECT 'Collection_Fabrics', COUNT(*) FROM collection_fabrics
UNION ALL
SELECT 'Albums', COUNT(*) FROM albums;

-- Xem fabrics theo material
SELECT material, COUNT(*) as count, AVG(price_per_meter) as avg_price
FROM fabrics
GROUP BY material
ORDER BY count DESC;

-- Xem collections và số lượng fabrics
SELECT
    c.name as collection_name,
    COUNT(cf.fabric_id) as fabric_count
FROM collections c
LEFT JOIN collection_fabrics cf ON c.id = cf.collection_id
GROUP BY c.id, c.name
ORDER BY fabric_count DESC;

