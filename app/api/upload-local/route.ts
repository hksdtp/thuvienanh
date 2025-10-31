import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import sharp from 'sharp'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '100.101.50.87',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tva',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'haininh1',
})

// Base directory for uploads on Ubuntu Server
const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR || '/data/Ninh/projects/thuvienanh'

// Folder structure matching Synology FileStation
const FOLDER_STRUCTURES = {
  fabric: {
    basePath: 'fabrics',
    subcategories: {
      moq: 'moq',
      new: 'new',
      clearance: 'clearance',
      demo: 'demo',
      default: 'general'
    }
  },
  collection: {
    basePath: 'collections',
    subcategories: {
      default: 'all'
    }
  },
  project: {
    basePath: 'projects',
    subcategories: {
      residential: 'residential',
      commercial: 'commercial',
      office: 'office',
      default: 'general'
    }
  },
  event: {
    basePath: 'events',
    subcategories: {
      internal: 'internal',
      external: 'external',
      training: 'training',
      default: 'general'
    }
  },
  style: {
    basePath: 'styles',
    subcategories: {
      default: 'general'
    }
  },
  accessory: {
    basePath: 'accessories',
    subcategories: {
      'phu-kien-trang-tri': 'decorative',
      'thanh-phu-kien': 'rods',
      'thanh-ly': 'clearance',
      default: 'general'
    }
  },
  album: {
    basePath: 'albums',
    subcategories: {
      fabric: 'fabrics',
      event: 'events',
      accessory: 'accessories',
      default: 'general'
    }
  }
}

type EntityType = keyof typeof FOLDER_STRUCTURES

/**
 * Validate file type using magic bytes
 */
function validateFileType(buffer: Buffer): { valid: boolean; mimeType: string } {
  const magicBytes = buffer.slice(0, 12)
  
  // JPEG: FF D8 FF
  if (magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF) {
    return { valid: true, mimeType: 'image/jpeg' }
  }
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4E && magicBytes[3] === 0x47) {
    return { valid: true, mimeType: 'image/png' }
  }
  
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (magicBytes[0] === 0x52 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46 && magicBytes[3] === 0x46 &&
      magicBytes[8] === 0x57 && magicBytes[9] === 0x45 && magicBytes[10] === 0x42 && magicBytes[11] === 0x50) {
    return { valid: true, mimeType: 'image/webp' }
  }
  
  return { valid: false, mimeType: 'unknown' }
}

/**
 * Generate unique filename
 */
function generateFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(7)
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${timestamp}-${randomStr}.${ext}`
}

/**
 * Compress image if > 5MB
 */
async function compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const sizeMB = buffer.length / 1024 / 1024
  
  if (sizeMB <= 5) {
    console.log(`📦 File size ${sizeMB.toFixed(2)} MB - no compression needed`)
    return buffer
  }
  
  console.log(`🗜️ Compressing image (${sizeMB.toFixed(2)} MB)...`)
  
  let compressed: Buffer
  
  if (mimeType === 'image/png') {
    compressed = await sharp(buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 85, compressionLevel: 9 })
      .toBuffer()
  } else if (mimeType === 'image/webp') {
    compressed = await sharp(buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
  } else {
    // Default to JPEG
    compressed = await sharp(buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer()
  }
  
  const compressedSizeMB = compressed.length / 1024 / 1024
  const reduction = ((sizeMB - compressedSizeMB) / sizeMB * 100).toFixed(1)
  
  console.log(`✅ Compressed: ${sizeMB.toFixed(2)} MB → ${compressedSizeMB.toFixed(2)} MB (${reduction}% reduction)`)
  
  return compressed
}

/**
 * Create thumbnail (400x400)
 */
async function createThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(400, 400, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()
}

/**
 * Ensure directory exists
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true })
    console.log(`📁 Created directory: ${dirPath}`)
  }
}

/**
 * Save to database based on entity type
 */
async function saveToDatabase(
  entityType: EntityType,
  entityId: string,
  imageUrl: string,
  thumbnailUrl: string,
  fileName: string
): Promise<void> {
  const timestamp = Date.now()
  const imageId = `${timestamp}-${Math.random().toString(36).substring(7)}`

  switch (entityType) {
    case 'fabric':
      await pool.query(`
        INSERT INTO fabric_images (fabric_id, image_url, image_id, caption, display_order)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(display_order), 0) + 1 
          FROM fabric_images 
          WHERE fabric_id = $1
        ))
      `, [entityId, imageUrl, imageId, fileName])
      break

    case 'collection':
      await pool.query(`
        UPDATE collections 
        SET thumbnail_url = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [imageUrl, entityId])
      break

    case 'project':
      await pool.query(`
        INSERT INTO project_images (project_id, image_url, image_id, caption, display_order)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(display_order), 0) + 1 
          FROM project_images 
          WHERE project_id = $1
        ))
        ON CONFLICT DO NOTHING
      `, [entityId, imageUrl, imageId, fileName])
      break

    case 'event':
      await pool.query(`
        INSERT INTO event_images (event_id, image_url, image_id, caption, display_order)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(display_order), 0) + 1 
          FROM event_images 
          WHERE event_id = $1
        ))
        ON CONFLICT DO NOTHING
      `, [entityId, imageUrl, imageId, fileName])
      break

    case 'style':
      await pool.query(`
        UPDATE styles 
        SET thumbnail_url = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [imageUrl, entityId])
      break

    case 'accessory':
      await pool.query(`
        INSERT INTO accessory_images (accessory_id, image_url, image_id, caption, display_order)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(display_order), 0) + 1 
          FROM accessory_images 
          WHERE accessory_id = $1
        ))
        ON CONFLICT DO NOTHING
      `, [entityId, imageUrl, imageId, fileName])
      break

    case 'album':
      await pool.query(`
        INSERT INTO album_images (album_id, image_url, image_id, caption, display_order)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(display_order), 0) + 1 
          FROM album_images 
          WHERE album_id = $1
        ))
      `, [entityId, imageUrl, imageId, fileName])
      break
  }
}

/**
 * POST /api/upload-local
 * Upload images to Ubuntu Server local storage
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const entityType = formData.get('entityType') as EntityType
    const entityId = formData.get('entityId') as string
    const subcategory = formData.get('subcategory') as string
    const file = formData.get('file') as File

    // Validate required fields
    if (!entityType || !entityId || !file) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: entityType, entityId, file'
      }, { status: 400 })
    }

    // Validate entity type
    const folderConfig = FOLDER_STRUCTURES[entityType]
    if (!folderConfig) {
      return NextResponse.json({
        success: false,
        error: `Invalid entity type: ${entityType}`
      }, { status: 400 })
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    let buffer: Buffer = Buffer.from(bytes)

    // Validate file type
    const { valid, mimeType } = validateFileType(buffer)
    if (!valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
      }, { status: 400 })
    }

    console.log(`📤 Uploading ${file.name} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)

    // Compress if needed
    buffer = await compressImage(buffer, mimeType)

    // Create thumbnail
    const thumbnailBuffer = await createThumbnail(buffer)

    // Generate filenames
    const filename = generateFilename(file.name)
    const thumbnailFilename = `thumb_${filename}`

    // Determine subcategory path
    const subPath = subcategory && (folderConfig.subcategories as any)[subcategory]
      ? (folderConfig.subcategories as any)[subcategory]
      : folderConfig.subcategories.default

    // Create directory paths
    const uploadDir = join(UPLOAD_BASE_DIR, folderConfig.basePath, subPath)
    await ensureDirectory(uploadDir)

    // Save files
    const filePath = join(uploadDir, filename)
    const thumbnailPath = join(uploadDir, thumbnailFilename)

    await writeFile(filePath, buffer)
    await writeFile(thumbnailPath, thumbnailBuffer)

    console.log(`✅ Saved: ${filePath}`)
    console.log(`✅ Thumbnail: ${thumbnailPath}`)

    // Generate URLs
    const baseUrl = `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
    const imageUrl = `${baseUrl}/uploads/local/${folderConfig.basePath}/${subPath}/${filename}`
    const thumbnailUrl = `${baseUrl}/uploads/local/${folderConfig.basePath}/${subPath}/${thumbnailFilename}`

    // Save to database
    await saveToDatabase(entityType, entityId, imageUrl, thumbnailUrl, file.name)

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        thumbnailUrl,
        filename,
        path: filePath,
        size: buffer.length,
        mimeType
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

