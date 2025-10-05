// API Routes cho Fabric Images
// POST /api/fabrics/[id]/images - Thêm ảnh vào fabric
// GET /api/fabrics/[id]/images - Lấy danh sách ảnh của fabric
// DELETE /api/fabrics/[id]/images/[imageId] - Xóa ảnh khỏi fabric

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { ApiResponse } from '@/types/database'

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Lấy danh sách ảnh của fabric
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const result = await query(
      `SELECT * FROM fabric_images 
       WHERE fabric_id = $1 
       ORDER BY sort_order ASC, uploaded_at DESC`,
      [params.id]
    )
    
    const response: ApiResponse<typeof result.rows> = {
      success: true,
      data: result.rows
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching fabric images:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể tải danh sách ảnh'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// POST - Thêm ảnh vào fabric
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { url, alt_text, is_primary = false, sort_order = 0 } = body
    
    if (!url) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'URL ảnh là bắt buộc'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Nếu set làm ảnh chính, bỏ primary của các ảnh khác
    if (is_primary) {
      await query(
        `UPDATE fabric_images 
         SET is_primary = false 
         WHERE fabric_id = $1`,
        [params.id]
      )
      
      // Cập nhật primary_image_url trong bảng fabrics
      await query(
        `UPDATE fabrics 
         SET primary_image_url = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [url, params.id]
      )
    }
    
    // Thêm ảnh mới
    const result = await query(
      `INSERT INTO fabric_images (fabric_id, url, alt_text, is_primary, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [params.id, url, alt_text || '', is_primary, sort_order]
    )
    
    const response: ApiResponse<typeof result.rows[0]> = {
      success: true,
      data: result.rows[0],
      message: 'Thêm ảnh thành công'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error adding fabric image:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể thêm ảnh'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// DELETE - Xóa ảnh khỏi fabric
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')
    
    if (!imageId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Image ID là bắt buộc'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Xóa ảnh
    await query(
      `DELETE FROM fabric_images 
       WHERE id = $1 AND fabric_id = $2`,
      [imageId, params.id]
    )
    
    const response: ApiResponse<{ deleted: boolean }> = {
      success: true,
      data: { deleted: true },
      message: 'Xóa ảnh thành công'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting fabric image:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể xóa ảnh'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

