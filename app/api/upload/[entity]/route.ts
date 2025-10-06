import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { saveFile, EntityType, generateEntityId } from '@/lib/uploadUtils'

const pool = new Pool({
  host: process.env.DB_HOST || '222.252.23.248',
  port: parseInt(process.env.DB_PORT || '5499'),
  database: process.env.DB_NAME || 'Ninh96',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Demo1234',
})

const VALID_ENTITIES: EntityType[] = ['fabric', 'collection', 'project', 'event', 'style', 'accessory', 'album']

export async function POST(
  request: NextRequest,
  context: { params: { entity: string } }
) {
  try {
    const entity = context.params.entity as EntityType
    
    // Validate entity type
    if (!VALID_ENTITIES.includes(entity)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid entity type: ${entity}`
        },
        { status: 400 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const entityId = formData.get('entityId') as string || generateEntityId()
    const category = formData.get('category') as string | undefined

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided'
        },
        { status: 400 }
      )
    }

    // Save file to disk
    const { filename, url, path: filePath } = await saveFile(file, entity, entityId, category)

    // Update database based on entity type
    let updateResult
    
    switch (entity) {
      case 'fabric':
        updateResult = await pool.query(`
          UPDATE fabrics 
          SET image_url = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, name, image_url
        `, [url, entityId])
        break
        
      case 'collection':
        updateResult = await pool.query(`
          UPDATE collections 
          SET thumbnail_url = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, name, thumbnail_url
        `, [url, entityId])
        break
        
      case 'project':
        updateResult = await pool.query(`
          UPDATE projects 
          SET cover_image_url = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, name, cover_image_url
        `, [url, entityId])
        break
        
      case 'event':
        updateResult = await pool.query(`
          UPDATE events 
          SET cover_image_url = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, name, cover_image_url
        `, [url, entityId])
        break
        
      case 'style':
        updateResult = await pool.query(`
          UPDATE styles 
          SET thumbnail_url = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, name, thumbnail_url
        `, [url, entityId])
        break
        
      case 'accessory':
        updateResult = await pool.query(`
          UPDATE accessories 
          SET image_url = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, name, image_url
        `, [url, entityId])
        break
        
      case 'album':
        updateResult = await pool.query(`
          UPDATE albums 
          SET cover_image_url = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, name, cover_image_url
        `, [url, entityId])
        break
    }

    return NextResponse.json({
      success: true,
      data: {
        filename,
        url,
        entityId,
        entity: updateResult?.rows[0]
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve upload info
export async function GET(
  request: NextRequest,
  context: { params: { entity: string } }
) {
  try {
    const entity = context.params.entity as EntityType
    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entityId')

    if (!entityId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Entity ID required'
        },
        { status: 400 }
      )
    }

    // Query database based on entity type
    let result
    
    switch (entity) {
      case 'fabric':
        result = await pool.query(`
          SELECT id, name, image_url, created_at, updated_at
          FROM fabrics WHERE id = $1
        `, [entityId])
        break
        
      case 'collection':
        result = await pool.query(`
          SELECT id, name, thumbnail_url as image_url, created_at, updated_at
          FROM collections WHERE id = $1
        `, [entityId])
        break
        
      case 'project':
        result = await pool.query(`
          SELECT id, name, cover_image_url as image_url, created_at, updated_at
          FROM projects WHERE id = $1
        `, [entityId])
        break
        
      case 'event':
        result = await pool.query(`
          SELECT id, name, cover_image_url as image_url, created_at, updated_at
          FROM events WHERE id = $1
        `, [entityId])
        break
        
      case 'style':
        result = await pool.query(`
          SELECT id, name, thumbnail_url as image_url, created_at, updated_at
          FROM styles WHERE id = $1
        `, [entityId])
        break
        
      case 'accessory':
        result = await pool.query(`
          SELECT id, name, image_url, created_at, updated_at
          FROM accessories WHERE id = $1
        `, [entityId])
        break
        
      case 'album':
        result = await pool.query(`
          SELECT id, name, cover_image_url as image_url, created_at, updated_at
          FROM albums WHERE id = $1
        `, [entityId])
        break
    }

    if (result && result.rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: result.rows[0]
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Entity not found'
        },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Get upload info error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get upload info'
      },
      { status: 500 }
    )
  }
}

