-- Migration: Add Synology-specific fields to album_images table
-- Date: 2024-01-10
-- Description: Add fields for storing Synology Photos metadata and compression stats

-- Add new columns
ALTER TABLE album_images 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS synology_id INTEGER,
ADD COLUMN IF NOT EXISTS folder_id INTEGER,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS compressed_size INTEGER,
ADD COLUMN IF NOT EXISTS compression_ratio DECIMAL(5,2);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_album_images_synology_id ON album_images(synology_id);
CREATE INDEX IF NOT EXISTS idx_album_images_folder_id ON album_images(folder_id);

-- Add comments for documentation
COMMENT ON COLUMN album_images.thumbnail_url IS 'Synology thumbnail URL for preview';
COMMENT ON COLUMN album_images.synology_id IS 'Original file ID from Synology Photos';
COMMENT ON COLUMN album_images.folder_id IS 'Folder ID in Synology Photos';
COMMENT ON COLUMN album_images.file_size IS 'Original file size in bytes';
COMMENT ON COLUMN album_images.compressed_size IS 'Compressed file size in bytes';
COMMENT ON COLUMN album_images.compression_ratio IS 'Compression ratio percentage';

-- Verify changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'album_images' 
  AND column_name IN ('thumbnail_url', 'synology_id', 'folder_id', 'file_size', 'compressed_size', 'compression_ratio')
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '   Added 6 new columns to album_images table';
    RAISE NOTICE '   Created 2 new indexes';
END $$;

