-- ============================================
-- Script: Xóa toàn bộ dữ liệu mẫu/giả
-- Mục đích: Reset database về trạng thái sạch
-- Ngày: 2025-09-30
-- ============================================

-- Bắt đầu transaction
BEGIN;

-- ============================================
-- 1. XÓA DỮ LIỆU LIÊN QUAN ĐẾN ẢNH
-- ============================================

-- Xóa ảnh trong albums
DELETE FROM album_images;

-- Xóa ảnh vải
DELETE FROM fabric_images;

-- ============================================
-- 2. XÓA DỮ LIỆU LIÊN KẾT
-- ============================================

-- Xóa liên kết collection-fabric
DELETE FROM collection_fabrics;

-- ============================================
-- 3. XÓA DỮ LIỆU CHÍNH
-- ============================================

-- Xóa albums
DELETE FROM albums;

-- Xóa fabrics (vải)
DELETE FROM fabrics;

-- Xóa collections (bộ sưu tập)
DELETE FROM collections;

-- ============================================
-- 4. XÓA USERS (TRỪ ADMIN)
-- ============================================

-- Giữ lại user admin, xóa các user khác
DELETE FROM users WHERE role != 'admin';

-- Commit transaction
COMMIT;

-- ============================================
-- VERIFY KẾT QUẢ
-- ============================================

SELECT 'Fabrics: ' || COUNT(*) || ' records' FROM fabrics;
SELECT 'Collections: ' || COUNT(*) || ' records' FROM collections;
SELECT 'Albums: ' || COUNT(*) || ' records' FROM albums;
SELECT 'Users: ' || COUNT(*) || ' records' FROM users;

