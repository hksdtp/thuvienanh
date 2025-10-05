// API Routes cho Collections
// GET /api/collections - Lấy danh sách collections
// POST /api/collections - Tạo collection mới

import { NextRequest, NextResponse } from 'next/server'
import { CollectionService } from '@/lib/database'
import { CreateCollectionForm, CollectionFilter, ApiResponse } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filter: CollectionFilter = {}
    
    if (searchParams.get('search')) {
      filter.search = searchParams.get('search')!
    }
    
    if (searchParams.get('created_by')) {
      filter.created_by = searchParams.get('created_by')!
    }
    
    if (searchParams.get('is_active')) {
      filter.is_active = searchParams.get('is_active') === 'true'
    }
    
    const collections = await CollectionService.getAll(filter)
    
    const response: ApiResponse<typeof collections> = {
      success: true,
      data: collections,
      message: `Tìm thấy ${collections.length} bộ sưu tập`
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching collections:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể tải danh sách bộ sưu tập'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Tên bộ sưu tập là bắt buộc'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    if (body.name.trim().length > 255) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Tên bộ sưu tập không được vượt quá 255 ký tự'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    const formData: CreateCollectionForm = {
      name: body.name.trim(),
      description: body.description?.trim() || undefined
    }
    
    // TODO: Get user ID from authentication
    const userId = 'current_user_id'
    
    const newCollection = await CollectionService.create(formData, userId)
    
    const response: ApiResponse<typeof newCollection> = {
      success: true,
      data: newCollection,
      message: 'Tạo bộ sưu tập thành công'
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating collection:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể tạo bộ sưu tập'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
