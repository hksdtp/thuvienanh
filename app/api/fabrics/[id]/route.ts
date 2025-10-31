// API Routes cho Fabric cụ thể
// GET /api/fabrics/[id] - Lấy thông tin fabric chi tiết
// PATCH /api/fabrics/[id] - Cập nhật fabric
// DELETE /api/fabrics/[id] - Xóa fabric (soft delete)

import { NextRequest, NextResponse } from 'next/server'
import { FabricService } from '@/lib/database'
import { ApiResponse } from '@/types/database'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const fabric = await FabricService.getById(params.id)

    if (!fabric) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không tìm thấy vải'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<typeof fabric> = {
      success: true,
      data: fabric
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching fabric:', error)

    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể tải thông tin vải'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    // Validate name if provided
    if (body.name !== undefined && (!body.name || body.name.trim().length === 0)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Tên vải không được để trống'
      }
      return NextResponse.json(response, { status: 400 })
    }

    const updatedFabric = await FabricService.update(params.id, body)

    if (!updatedFabric) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không tìm thấy vải để cập nhật'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<typeof updatedFabric> = {
      success: true,
      data: updatedFabric,
      message: 'Cập nhật vải thành công'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating fabric:', error)

    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể cập nhật vải'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const deleted = await FabricService.delete(params.id)

    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không tìm thấy vải để xóa'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Xóa vải thành công'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting fabric:', error)

    const response: ApiResponse<null> = {
      success: false,
      error: 'Không thể xóa vải'
    }

    return NextResponse.json(response, { status: 500 })
  }
}
