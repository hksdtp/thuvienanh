import { NextRequest, NextResponse } from 'next/server'
import { createFolderName } from '@/lib/utils'
import { SynologyFileStationService } from '@/lib/synology'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '100.101.50.87',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tva',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'haininh1',
})

// Define folder structure for each entity type
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
      modern: 'modern',
      classic: 'classic',
      minimalist: 'minimalist',
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

/**
 * Universal upload endpoint for all entity types to Synology FileStation
 * Maintains consistent folder structure across all categories
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const entityType = formData.get('entityType') as keyof typeof FOLDER_STRUCTURES
    const entityId = formData.get('entityId') as string
    const entityName = formData.get('entityName') as string
    const subcategory = formData.get('subcategory') as string
    const files = formData.getAll('files') as File[]

    // Validate required fields
    if (!entityType || !entityId || !entityName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: entityType, entityId, entityName'
      }, { status: 400 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 })
    }

    // Get folder structure for entity type
    const folderConfig = FOLDER_STRUCTURES[entityType]
    if (!folderConfig) {
      return NextResponse.json({
        success: false,
        error: `Invalid entity type: ${entityType}`
      }, { status: 400 })
    }

    // Determine subcategory path
    const subPath = subcategory && (folderConfig.subcategories as any)[subcategory]
      ? (folderConfig.subcategories as any)[subcategory]
      : folderConfig.subcategories.default

    // Generate folder path
    const folderName = createFolderName(entityName, entityId)
    const destinationPath = `/Marketing/Ninh/thuvienanh/${folderConfig.basePath}/${subPath}/${folderName}`

    console.log(`📤 Uploading ${files.length} files for ${entityType}`)
    console.log(`📁 Destination: ${destinationPath}`)

    // Initialize FileStation
    const fileStation = new SynologyFileStationService()
    const authSuccess = await fileStation.authenticate()
    
    if (!authSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Failed to authenticate with Synology FileStation'
      }, { status: 500 })
    }

    // Upload files
    const uploadedFiles = []
    const errors = []
    const baseUrl = `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`

    for (const file of files) {
      try {
        console.log(`📤 Uploading ${file.name}...`)
        
        // Create folder if needed and upload file
        const uploadResult = await fileStation.uploadFile(file, destinationPath)
        
        if (uploadResult.success && uploadResult.data) {
          const filePath = `${destinationPath}/${file.name}`
          const fileUrl = `${baseUrl}/api/synology/file-proxy?path=${encodeURIComponent(filePath)}`
          
          // Save to database based on entity type
          await saveToDatabase(entityType, entityId, fileUrl, file.name)
          
          uploadedFiles.push({
            name: file.name,
            url: fileUrl,
            path: filePath
          })
          
          console.log(`✅ Uploaded: ${file.name}`)
        } else {
          errors.push(`Failed to upload ${file.name}`)
          console.error(`❌ Failed: ${file.name}`)
        }
      } catch (error) {
        const msg = `Error uploading ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(msg)
        console.error(`❌ ${msg}`)
      }
    }

    return NextResponse.json({
      success: uploadedFiles.length > 0,
      data: {
        uploaded: uploadedFiles.length,
        files: uploadedFiles,
        ...(errors.length > 0 && { errors })
      }
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// Helper function to save file info to database
async function saveToDatabase(
  entityType: string,
  entityId: string,
  fileUrl: string,
  fileName: string
): Promise<void> {
  const timestamp = Date.now()
  const imageId = `${timestamp}-${Math.random().toString(36).substring(7)}`

  switch (entityType) {
    case 'fabric':
      // Update main image or add to fabric_images table
      await pool.query(`
        INSERT INTO fabric_images (fabric_id, image_url, image_id, caption, display_order)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(display_order), 0) + 1 
          FROM fabric_images 
          WHERE fabric_id = $1
        ))
      `, [entityId, fileUrl, imageId, fileName])
      break

    case 'collection':
      // Update thumbnail or add to collection_images if exists
      await pool.query(`
        UPDATE collections 
        SET thumbnail_url = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [fileUrl, entityId])
      break

    case 'project':
      // Add to project_images table
      await pool.query(`
        INSERT INTO project_images (project_id, image_url, image_id, caption, display_order)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(display_order), 0) + 1 
          FROM project_images 
          WHERE project_id = $1
        ))
        ON CONFLICT DO NOTHING
      `, [entityId, fileUrl, imageId, fileName])
      break

    case 'event':
      // Add to event_images table
      await pool.query(`
        INSERT INTO event_images (event_id, image_url, image_id, caption, display_order)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(display_order), 0) + 1 
          FROM event_images 
          WHERE event_id = $1
        ))
        ON CONFLICT DO NOTHING
      `, [entityId, fileUrl, imageId, fileName])
      break

    case 'style':
      // Update style thumbnail
      await pool.query(`
        UPDATE styles 
        SET thumbnail_url = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [fileUrl, entityId])
      break

    case 'accessory':
      // Add to accessory_images table
      await pool.query(`
        INSERT INTO accessory_images (accessory_id, image_url, image_id, caption, display_order)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(display_order), 0) + 1 
          FROM accessory_images 
          WHERE accessory_id = $1
        ))
        ON CONFLICT DO NOTHING
      `, [entityId, fileUrl, imageId, fileName])
      break

    case 'album':
      // Already handled by separate album upload endpoint
      await pool.query(`
        INSERT INTO album_images (album_id, image_url, image_id, caption, display_order)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(display_order), 0) + 1 
          FROM album_images 
          WHERE album_id = $1
        ))
      `, [entityId, fileUrl, imageId, fileName])
      break
  }
}
