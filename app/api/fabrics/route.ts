// API Routes cho Fabrics
// GET /api/fabrics - Lấy danh sách fabrics với filter
// POST /api/fabrics - Tạo fabric mới

import { NextRequest, NextResponse } from 'next/server'
import { FabricService } from '@/lib/database'
import { FabricFilter, ApiResponse } from '@/types/database'
import { SynologyFileStationService } from '@/lib/synology'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filter: FabricFilter = {}
    
    if (searchParams.get('search')) {
      filter.search = searchParams.get('search')!
    }
    
    if (searchParams.get('material')) {
      filter.material = searchParams.get('material')!.split(',')
    }
    
    if (searchParams.get('color')) {
      filter.color = searchParams.get('color')!.split(',')
    }
    
    if (searchParams.get('pattern')) {
      filter.pattern = searchParams.get('pattern')!.split(',')
    }
    
    if (searchParams.get('collection_id')) {
      filter.collection_id = searchParams.get('collection_id')!
    }
    
    if (searchParams.get('tags')) {
      filter.tags = searchParams.get('tags')!.split(',')
    }
    
    if (searchParams.get('stock_status')) {
      filter.stock_status = searchParams.get('stock_status') as any
    }
    
    // Parse price range
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    if (minPrice || maxPrice) {
      filter.price_range = {
        min: minPrice ? parseFloat(minPrice) : 0,
        max: maxPrice ? parseFloat(maxPrice) : Infinity
      }
    }

    // Parse MOQ range
    const minMOQ = searchParams.get('min_moq')
    const maxMOQ = searchParams.get('max_moq')
    if (minMOQ || maxMOQ) {
      filter.min_order_quantity = {
        min: minMOQ ? parseInt(minMOQ) : 0,
        max: maxMOQ ? parseInt(maxMOQ) : Infinity
      }
    }

    // Parse created_after for "new" filter
    const createdAfter = searchParams.get('created_after')
    if (createdAfter) {
      filter.created_after = createdAfter
    }
    
    const fabrics = await FabricService.getAll(filter)
    
    const response: ApiResponse<typeof fabrics> = {
      success: true,
      data: fabrics,
      message: `Tìm thấy ${fabrics.length} loại vải`
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching fabrics:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể tải danh sách vải'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/fabrics - Tạo fabric mới
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract fabric data
    const fabricData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      description: formData.get('description') as string || '',
      material: formData.get('material') as string,
      width: parseInt(formData.get('width') as string),
      weight: parseInt(formData.get('weight') as string),
      color: formData.get('color') as string,
      pattern: formData.get('pattern') as string || '',
      finish: formData.get('finish') as string || '',
      origin: formData.get('origin') as string || '',
      price_per_meter: parseFloat(formData.get('price_per_meter') as string),
      stock_quantity: parseInt(formData.get('stock_quantity') as string) || 0,
      min_order_quantity: parseInt(formData.get('min_order_quantity') as string) || 1,
      tags: JSON.parse(formData.get('tags') as string || '[]'),
      search_keywords: formData.get('search_keywords') as string || ''
    }

    console.log('📝 Creating new fabric:', fabricData)

    // Validate required fields
    if (!fabricData.name || !fabricData.code || !fabricData.material || !fabricData.color) {
      return NextResponse.json({
        success: false,
        error: 'Thiếu thông tin bắt buộc: name, code, material, color'
      } as ApiResponse<null>, { status: 400 })
    }

    // Get images from formData
    const images = formData.getAll('images') as File[]
    console.log(`📸 Received ${images.length} images`)

    // Upload images to Synology FileStation
    let primaryImageUrl = ''
    const uploadedImages: string[] = []

    if (images.length > 0) {
      console.log('📤 Uploading images to Synology FileStation...')

      // Authenticate with Synology
      const fileStation = new SynologyFileStationService()
      const authSuccess = await fileStation.authenticate()

      if (!authSuccess) {
        console.error('❌ Failed to authenticate with Synology FileStation')
        return NextResponse.json({
          success: false,
          error: 'Không thể kết nối với Synology. Vui lòng thử lại sau.'
        } as ApiResponse<null>, { status: 500 })
      }

      // Generate folder path: /Marketing/Ninh/thuvienanh/fabrics/{fabric-code}
      const destinationPath = `/Marketing/Ninh/thuvienanh/fabrics/${fabricData.code}`
      console.log(`📁 Uploading ${images.length} files to: ${destinationPath}`)

      for (let i = 0; i < images.length; i++) {
        const image = images[i]

        try {
          console.log(`📤 Uploading ${i + 1}/${images.length}: ${image.name} (${image.size} bytes)`)

          const uploadResult = await fileStation.uploadFile(image, destinationPath)

          if (uploadResult.success) {
            // Use original filename from upload result - use relative URL to avoid Next.js Image Optimizer 503 errors
            const filePath = `${destinationPath}/${image.name}`
            const imageUrl = `/api/synology/file-proxy?path=${encodeURIComponent(filePath)}`
            uploadedImages.push(imageUrl)

            if (i === 0) {
              primaryImageUrl = imageUrl
            }

            console.log(`✅ Uploaded image ${i + 1}/${images.length}`)
            console.log(`   File path: ${filePath}`)
            console.log(`   Image URL: ${imageUrl}`)
          } else {
            console.error(`❌ Failed to upload ${image.name}:`, uploadResult.error)
          }
        } catch (uploadError) {
          console.error(`❌ Error uploading image ${i + 1}:`, uploadError)
        }
      }
    }

    // Create fabric in database
    const { getPool } = await import('@/lib/db')
    const pool = getPool()

    const insertQuery = `
      INSERT INTO fabrics (
        name,
        code,
        description,
        material,
        width,
        weight,
        color,
        pattern,
        finish,
        origin,
        price_per_meter,
        stock_quantity,
        min_order_quantity,
        primary_image_url,
        tags,
        search_keywords,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true)
      RETURNING *
    `

    const result = await pool.query(insertQuery, [
      fabricData.name,
      fabricData.code,
      fabricData.description,
      fabricData.material,
      fabricData.width,
      fabricData.weight,
      fabricData.color,
      fabricData.pattern,
      fabricData.finish,
      fabricData.origin,
      fabricData.price_per_meter,
      fabricData.stock_quantity,
      fabricData.min_order_quantity,
      primaryImageUrl,
      fabricData.tags,
      fabricData.search_keywords
    ])

    const newFabric = result.rows[0]
    console.log('✅ Created fabric:', newFabric.id, '-', newFabric.name)

    // Insert ALL images into fabric_images table
    if (uploadedImages.length > 0) {
      console.log(`📸 Inserting ${uploadedImages.length} images into fabric_images table...`)

      for (let i = 0; i < uploadedImages.length; i++) {
        const imageUrl = uploadedImages[i]
        const isPrimary = i === 0

        await pool.query(`
          INSERT INTO fabric_images (
            fabric_id,
            url,
            sort_order,
            is_primary
          ) VALUES ($1, $2, $3, $4)
        `, [newFabric.id, imageUrl, i, isPrimary])

        console.log(`  ✅ Inserted image ${i + 1}/${uploadedImages.length} (primary: ${isPrimary})`)
      }

      console.log(`✅ Inserted ${uploadedImages.length} images into fabric_images table`)
    }

    return NextResponse.json({
      success: true,
      data: newFabric,
      message: `Đã tạo vải mới: ${newFabric.name}`
    } as ApiResponse<typeof newFabric>)

  } catch (error) {
    console.error('❌ Error creating fabric:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể tạo vải mới'
    } as ApiResponse<null>, { status: 500 })
  }
}
