import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'
import { ApiResponse } from '@/types/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { imageId, imageUrl } = body

    if (!imageId || !imageUrl) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Thiếu imageId hoặc imageUrl'
      }
      return NextResponse.json(response, { status: 400 })
    }

    const updated = await AlbumService.setCoverImage(id, imageId, imageUrl)

    const response: ApiResponse<{ updated: boolean }> = {
      success: true,
      data: { updated },
      message: 'Đã đặt ảnh bìa thành công'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Set cover image API error:', error)

    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi đặt ảnh bìa'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

