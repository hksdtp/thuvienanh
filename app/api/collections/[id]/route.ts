// API Routes cho Collection cụ thể
// GET /api/collections/[id] - Lấy thông tin collection
// PUT /api/collections/[id] - Cập nhật collection  
// DELETE /api/collections/[id] - Xóa collection

import { NextRequest, NextResponse } from 'next/server'
import { CollectionService } from '@/lib/database'
import { UpdateCollectionForm, ApiResponse } from '@/types/database'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const collection = await CollectionService.getById(params.id)
    
    if (!collection) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không tìm thấy bộ sưu tập'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    const response: ApiResponse<typeof collection> = {
      success: true,
      data: collection
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching collection:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể tải thông tin bộ sưu tập'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    
    const formData: UpdateCollectionForm = {
      id: params.id,
      name: body.name.trim(),
      description: body.description?.trim() || undefined
    }
    
    const updatedCollection = await CollectionService.update(params.id, formData)
    
    if (!updatedCollection) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không tìm thấy bộ sưu tập để cập nhật'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    const response: ApiResponse<typeof updatedCollection> = {
      success: true,
      data: updatedCollection,
      message: 'Cập nhật bộ sưu tập thành công'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating collection:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể cập nhật bộ sưu tập'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const success = await CollectionService.delete(params.id)
    
    if (!success) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không tìm thấy bộ sưu tập để xóa'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    const response: ApiResponse<null> = {
      success: true,
      message: 'Xóa bộ sưu tập thành công'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting collection:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể xóa bộ sưu tập'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
