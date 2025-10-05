// API Routes cho Fabric cụ thể
// GET /api/fabrics/[id] - Lấy thông tin fabric chi tiết

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
