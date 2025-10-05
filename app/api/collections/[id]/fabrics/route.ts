// API Routes cho Fabrics trong Collection
// GET /api/collections/[id]/fabrics - Lấy danh sách vải trong collection
// POST /api/collections/[id]/fabrics - Thêm vải vào collection
// DELETE /api/collections/[id]/fabrics - Xóa vải khỏi collection

import { NextRequest, NextResponse } from 'next/server'
import { CollectionService } from '@/lib/database'
import { ApiResponse } from '@/types/database'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Kiểm tra collection có tồn tại không
    const collection = await CollectionService.getById(params.id)
    if (!collection) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không tìm thấy bộ sưu tập'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    const fabrics = await CollectionService.getFabrics(params.id)
    
    const response: ApiResponse<typeof fabrics> = {
      success: true,
      data: fabrics,
      message: `Tìm thấy ${fabrics.length} loại vải trong bộ sưu tập`
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching collection fabrics:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể tải danh sách vải trong bộ sưu tập'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.fabric_id || typeof body.fabric_id !== 'string') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'ID vải là bắt buộc'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // TODO: Get user ID from authentication
    const userId = 'current_user_id'
    
    const success = await CollectionService.addFabric(
      params.id,
      body.fabric_id,
      userId,
      body.notes
    )
    
    if (!success) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không thể thêm vải vào bộ sưu tập. Vải có thể đã tồn tại trong bộ sưu tập hoặc không tìm thấy.'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    const response: ApiResponse<null> = {
      success: true,
      message: 'Thêm vải vào bộ sưu tập thành công'
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error adding fabric to collection:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể thêm vải vào bộ sưu tập'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const fabricId = searchParams.get('fabric_id')
    
    if (!fabricId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'ID vải là bắt buộc'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    const success = await CollectionService.removeFabric(params.id, fabricId)
    
    if (!success) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không tìm thấy vải trong bộ sưu tập để xóa'
      }
      return NextResponse.json(response, { status: 404 })
    }
    
    const response: ApiResponse<null> = {
      success: true,
      message: 'Xóa vải khỏi bộ sưu tập thành công'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error removing fabric from collection:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể xóa vải khỏi bộ sưu tập'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
