import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'
import { ApiResponse } from '@/types/database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: albumId, imageId } = await params

    // Get image info before deleting
    const images = await AlbumService.getImages(albumId)
    const image = images.find(img => img.id === imageId)

    if (!image) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Ảnh không tồn tại'
      }
      return NextResponse.json(response, { status: 404 })
    }

    console.log(`🗑️ Hard deleting image: ${imageId} from album ${albumId}`)

    // Get album info for folder path
    const album = await AlbumService.getById(albumId)
    if (!album) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Album không tồn tại'
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Import FileStation service
    const { SynologyFileStationService } = await import('@/lib/synology')
    const { createFolderName } = await import('@/lib/utils')
    const fileStation = new SynologyFileStationService()

    // Authenticate
    const authSuccess = await fileStation.authenticate()
    if (!authSuccess) {
      console.error('❌ FileStation authentication failed')
    }

    // Extract filename from image_url
    // image_url format: http://localhost:4000/api/synology/file-proxy?path=/Marketing/Ninh/thuvienanh/{category}/{folder}/{filename}
    if (authSuccess && image.image_url) {
      try {
        const urlParams = new URLSearchParams(image.image_url.split('?')[1])
        const filePath = urlParams.get('path')

        if (filePath) {
          console.log(`🗑️ Deleting Synology file: ${filePath}`)
          const fileDeleted = await fileStation.deleteFile(filePath)
          if (fileDeleted) {
            console.log(`✅ Synology file deleted: ${filePath}`)
          } else {
            console.log(`⚠️ Synology file not found or already deleted: ${filePath}`)
          }
        }
      } catch (error) {
        console.error(`❌ Error deleting Synology file:`, error)
        // Continue with database deletion even if Synology deletion fails
      }
    }

    // Delete from database
    const deleted = await AlbumService.removeImage(albumId, imageId)

    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không thể xóa ảnh khỏi database'
      }
      return NextResponse.json(response, { status: 500 })
    }

    console.log(`✅ Image deleted from database: ${imageId}`)

    const response: ApiResponse<{ deleted: boolean }> = {
      success: true,
      data: { deleted },
      message: 'Xóa ảnh thành công'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Delete album image API error:', error)

    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi xóa ảnh'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

