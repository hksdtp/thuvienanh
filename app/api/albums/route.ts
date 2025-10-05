// API endpoints cho Albums CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'
import { ApiResponse, AlbumFilter, CreateAlbumForm } from '@/types/database'
import { synologyService } from '@/lib/synology'
import { createFolderName } from '@/lib/utils'

// GET /api/albums - Lấy danh sách albums với filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filter parameters
    const filter: AlbumFilter = {}
    
    if (searchParams.get('search')) {
      filter.search = searchParams.get('search')!
    }
    
    if (searchParams.get('category')) {
      filter.category = searchParams.get('category') as any
    }
    
    if (searchParams.get('tags')) {
      filter.tags = searchParams.get('tags')!.split(',').map(tag => tag.trim())
    }
    
    if (searchParams.get('created_by')) {
      filter.created_by = searchParams.get('created_by')!
    }
    
    if (searchParams.get('start_date') && searchParams.get('end_date')) {
      filter.date_range = {
        start: new Date(searchParams.get('start_date')!),
        end: new Date(searchParams.get('end_date')!)
      }
    }
    
    const albums = await AlbumService.getAll(filter)
    
    const response: ApiResponse<typeof albums> = {
      success: true,
      data: albums,
      message: `Tìm thấy ${albums.length} album(s)`
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Get albums API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi lấy danh sách albums'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/albums - Tạo album mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Tên album là bắt buộc'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Validate category if provided
    const validCategories = ['fabric', 'collection', 'project', 'season', 'client', 'other']
    if (body.category && !validCategories.includes(body.category)) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Category không hợp lệ. Chỉ chấp nhận: ${validCategories.join(', ')}`
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Validate tags if provided
    if (body.tags && (!Array.isArray(body.tags) || body.tags.some((tag: any) => typeof tag !== 'string'))) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Tags phải là mảng các chuỗi'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    const albumData: CreateAlbumForm = {
      name: body.name.trim(),
      description: body.description?.trim() || undefined,
      category: body.category || 'other',
      tags: body.tags || []
    }

    const newAlbum = await AlbumService.create(albumData)

    // Tự động tạo folder trên Synology cho album mới
    // Tổ chức theo hierarchy: /thuvienanh/{category}/{album-name}_{id}
    const category = newAlbum.category || 'other'
    const folderName = createFolderName(newAlbum.name, newAlbum.id)
    const folderPath = `/Marketing/Ninh/thuvienanh/${category}/${folderName}`
    console.log(`📁 Creating Synology folder for new album: ${folderPath}`)
    console.log(`   Category: "${category}", Album: "${newAlbum.name}" => Folder: "${folderName}"`)

    try {
      const folderCreated = await synologyService.fileStation.createFolder(folderPath)
      if (folderCreated) {
        console.log(`✅ Synology folder created: ${folderPath}`)
      } else {
        console.warn(`⚠️ Failed to create Synology folder for album: ${newAlbum.id}`)
      }
    } catch (error) {
      console.error('❌ Error creating Synology folder:', error)
      // Không fail request nếu tạo folder thất bại
    }

    const response: ApiResponse<typeof newAlbum> = {
      success: true,
      data: newAlbum,
      message: 'Tạo album thành công'
    }

    return NextResponse.json(response, { status: 201 })
    
  } catch (error) {
    console.error('Create album API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi tạo album'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
