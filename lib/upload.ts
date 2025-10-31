// Upload utility functions và file management
import { writeFile, mkdir, unlink, stat } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Supported image types
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
] as const

export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
export const MAX_FILES_PER_UPLOAD = 10

export interface UploadedFile {
  id: string
  originalName: string
  fileName: string
  filePath: string
  url: string
  mimeType: string
  size: number
  width?: number
  height?: number
  uploadedAt: Date
}

export interface UploadError {
  file: string
  error: string
}

export interface UploadResult {
  success: UploadedFile[]
  errors: UploadError[]
}

// Tạo thư mục uploads nếu chưa tồn tại
export async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const fabricsDir = path.join(uploadDir, 'fabrics')
  const collectionsDir = path.join(uploadDir, 'collections')
  const tempDir = path.join(uploadDir, 'temp')

  try {
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    if (!existsSync(fabricsDir)) {
      await mkdir(fabricsDir, { recursive: true })
    }
    if (!existsSync(collectionsDir)) {
      await mkdir(collectionsDir, { recursive: true })
    }
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }
  } catch (error) {
    console.error('Error creating upload directories:', error)
    throw new Error('Failed to create upload directories')
  }
}

// Validate file type và size
export function validateFile(file: File): string | null {
  // Check file type
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
    return `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${SUPPORTED_IMAGE_TYPES.join(', ')}`
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File quá lớn. Kích thước tối đa: ${MAX_FILE_SIZE / 1024 / 1024}MB`
  }

  // Check file name
  if (!file.name || file.name.trim().length === 0) {
    return 'Tên file không hợp lệ'
  }

  return null
}

// Generate unique filename
export function generateFileName(originalName: string, category: 'fabrics' | 'collections' | 'temp' = 'temp'): string {
  const ext = path.extname(originalName).toLowerCase()
  const timestamp = Date.now()
  const uuid = uuidv4().split('-')[0] // Short UUID
  return `${category}_${timestamp}_${uuid}${ext}`
}

// Get file extension from mime type
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
  }
  return mimeToExt[mimeType] || '.jpg'
}

// Save uploaded file
export async function saveUploadedFile(
  file: File, 
  category: 'fabrics' | 'collections' | 'temp' = 'temp'
): Promise<UploadedFile> {
  await ensureUploadDir()

  const fileName = generateFileName(file.name, category)
  const filePath = path.join(process.cwd(), 'public', 'uploads', category, fileName)
  const url = `/uploads/${category}/${fileName}`

  try {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file
    await writeFile(filePath, buffer)

    // Get file stats
    const stats = await stat(filePath)

    const uploadedFile: UploadedFile = {
      id: uuidv4(),
      originalName: file.name,
      fileName,
      filePath,
      url,
      mimeType: file.type,
      size: stats.size,
      uploadedAt: new Date()
    }

    return uploadedFile
  } catch (error) {
    console.error('Error saving file:', error)
    throw new Error(`Failed to save file: ${file.name}`)
  }
}

// Delete uploaded file
export async function deleteUploadedFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath)
    await unlink(fullPath)
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

// Move file from temp to permanent location
export async function moveFile(
  tempUrl: string, 
  category: 'fabrics' | 'collections'
): Promise<string> {
  const tempPath = path.join(process.cwd(), 'public', tempUrl)
  const fileName = path.basename(tempUrl).replace('temp_', `${category}_`)
  const newPath = path.join(process.cwd(), 'public', 'uploads', category, fileName)
  const newUrl = `/uploads/${category}/${fileName}`

  try {
    // Read temp file
    const buffer = await import('fs/promises').then(fs => fs.readFile(tempPath))
    
    // Write to new location
    await writeFile(newPath, buffer)
    
    // Delete temp file
    await unlink(tempPath)
    
    return newUrl
  } catch (error) {
    console.error('Error moving file:', error)
    throw new Error('Failed to move file')
  }
}

// Clean up old temp files (older than 1 hour)
export async function cleanupTempFiles(): Promise<void> {
  const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp')
  
  try {
    const { readdir, stat, unlink } = await import('fs/promises')
    const files = await readdir(tempDir)
    const oneHourAgo = Date.now() - (60 * 60 * 1000)

    for (const file of files) {
      const filePath = path.join(tempDir, file)
      const stats = await stat(filePath)
      
      if (stats.mtime.getTime() < oneHourAgo) {
        await unlink(filePath)
        console.log(`Cleaned up temp file: ${file}`)
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error)
  }
}

// Get image dimensions (basic implementation)
export async function getImageDimensions(filePath: string): Promise<{ width: number; height: number } | null> {
  // This is a placeholder - in a real app, you'd use a library like 'sharp' or 'jimp'
  // For now, return null and handle dimensions on the client side
  return null
}

// Optimize image (placeholder)
export async function optimizeImage(filePath: string): Promise<void> {
  // Placeholder for image optimization
  // In a real app, you'd use libraries like 'sharp' to:
  // - Resize images
  // - Compress images
  // - Convert formats
  // - Generate thumbnails
  console.log(`Image optimization placeholder for: ${filePath}`)
}
