import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export type EntityType = 'fabric' | 'collection' | 'project' | 'event' | 'style' | 'accessory' | 'album'

/**
 * Sanitize filename: remove special chars, spaces, lowercase
 */
export function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename)
  const name = path.basename(filename, ext)
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + ext.toLowerCase()
}

/**
 * Generate unique filename with entity type, id, timestamp
 * Format: {entity-type}-{entity-id}-{timestamp}-{original-filename}
 */
export function generateFilename(
  entityType: EntityType,
  entityId: string,
  originalFilename: string
): string {
  const timestamp = Date.now()
  const sanitized = sanitizeFilename(originalFilename)
  return `${entityType}-${entityId}-${timestamp}-${sanitized}`
}

/**
 * Get upload directory path for entity
 * Format: /uploads/{entity-type}/{category?}/{year}/{month}/
 */
export function getUploadPath(
  entityType: EntityType,
  category?: string
): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  
  const basePath = path.join(process.cwd(), 'public', 'uploads')
  
  if (category) {
    return path.join(basePath, entityType + 's', category, String(year), month)
  }
  
  return path.join(basePath, entityType + 's', String(year), month)
}

/**
 * Get public URL for uploaded file
 */
export function getPublicUrl(
  entityType: EntityType,
  filename: string,
  category?: string
): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  
  if (category) {
    return `/uploads/${entityType}s/${category}/${year}/${month}/${filename}`
  }
  
  return `/uploads/${entityType}s/${year}/${month}/${filename}`
}

/**
 * Ensure directory exists, create if not
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Validate file type using magic bytes (not just extension)
 */
export function validateFileType(buffer: Buffer, allowedTypes: string[]): boolean {
  // Check magic bytes for common image formats
  const magicBytes = buffer.slice(0, 12)
  
  // JPEG: FF D8 FF
  if (magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF) {
    return allowedTypes.includes('image/jpeg')
  }
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4E && magicBytes[3] === 0x47) {
    return allowedTypes.includes('image/png')
  }
  
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (magicBytes[0] === 0x52 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46 && magicBytes[3] === 0x46 &&
      magicBytes[8] === 0x57 && magicBytes[9] === 0x45 && magicBytes[10] === 0x42 && magicBytes[11] === 0x50) {
    return allowedTypes.includes('image/webp')
  }
  
  return false
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(size: number, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size <= maxSizeBytes
}

/**
 * Save file to disk
 */
export async function saveFile(
  file: File,
  entityType: EntityType,
  entityId: string,
  category?: string
): Promise<{ filename: string; url: string; path: string }> {
  // Read file as buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validateFileType(buffer, allowedTypes)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
  }
  
  // Validate file size
  if (!validateFileSize(buffer.length)) {
    throw new Error('File size exceeds 5MB limit.')
  }
  
  // Generate filename and paths
  const filename = generateFilename(entityType, entityId, file.name)
  const uploadDir = getUploadPath(entityType, category)
  const filePath = path.join(uploadDir, filename)
  const publicUrl = getPublicUrl(entityType, filename, category)
  
  // Ensure directory exists
  ensureDirectoryExists(uploadDir)
  
  // Write file
  fs.writeFileSync(filePath, buffer)
  
  return {
    filename,
    url: publicUrl,
    path: filePath
  }
}

/**
 * Delete file from disk
 */
export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

/**
 * Generate entity ID if not provided
 */
export function generateEntityId(): string {
  return uuidv4()
}

