import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'
import { ApiResponse } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const images = await AlbumService.getImages(id)

    const response: ApiResponse<typeof images> = {
      success: true,
      data: images
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get album images API error:', error)

    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi lấy danh sách ảnh'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

