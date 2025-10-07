import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'
import { UpdateAlbumForm, ApiResponse } from '@/types/database'

// GET /api/albums/[id] - Get album by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const album = await AlbumService.getById(id)
    
    if (!album) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Album không tồn tại'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<typeof album> = {
      success: true,
      data: album
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get album API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi lấy thông tin album'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// PATCH /api/albums/[id] - Update album
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate input
    if (body.name !== undefined && typeof body.name !== 'string') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Tên album phải là chuỗi'
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (body.name !== undefined && !body.name.trim()) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Tên album không được để trống'
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (body.description !== undefined && typeof body.description !== 'string') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Mô tả phải là chuỗi'
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.some((tag: any) => typeof tag !== 'string'))) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Tags phải là mảng các chuỗi'
      }
      return NextResponse.json(response, { status: 400 })
    }

    const updateData: Partial<UpdateAlbumForm> = {}

    if (body.name !== undefined) {
      updateData.name = body.name.trim()
    }

    if (body.description !== undefined) {
      updateData.description = body.description.trim() || undefined
    }

    if (body.tags !== undefined) {
      updateData.tags = body.tags
    }

    const updatedAlbum = await AlbumService.update(id, updateData)

    if (!updatedAlbum) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Album không tồn tại'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<typeof updatedAlbum> = {
      success: true,
      data: updatedAlbum,
      message: 'Cập nhật album thành công'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Update album API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi cập nhật album'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// DELETE /api/albums/[id] - Delete album (hard delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get album info before deleting
    const album = await AlbumService.getById(id)
    if (!album) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Album không tồn tại'
      }
      return NextResponse.json(response, { status: 404 })
    }

    console.log(`🗑️ Hard deleting album: ${album.name} (${id})`)

    // Import FileStation service
    const { SynologyFileStationService } = await import('@/lib/synology')
    const { createFolderName } = await import('@/lib/utils')
    const fileStation = new SynologyFileStationService()

    // Authenticate
    const authSuccess = await fileStation.authenticate()
    if (!authSuccess) {
      console.error('❌ FileStation authentication failed')
    }

    // Delete folder from Synology FileStation
    const category = album.category || 'other'
    const folderName = createFolderName(album.name, id)
    const folderPath = `/Marketing/Ninh/thuvienanh/${category}/${folderName}`

    if (authSuccess) {
      console.log(`🗑️ Deleting Synology folder: ${folderPath}`)
      try {
        const folderDeleted = await fileStation.deleteFolder(folderPath)
        if (folderDeleted) {
          console.log(`✅ Synology folder deleted: ${folderPath}`)
        } else {
          console.log(`⚠️ Synology folder not found or already deleted: ${folderPath}`)
        }
      } catch (error) {
        console.error(`❌ Error deleting Synology folder:`, error)
        // Continue with database deletion even if Synology deletion fails
      }
    }

    // Delete from database (CASCADE will delete album_images automatically)
    const deleted = await AlbumService.delete(id)

    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không thể xóa album khỏi database'
      }
      return NextResponse.json(response, { status: 500 })
    }

    console.log(`✅ Album deleted from database: ${id}`)

    const response: ApiResponse<null> = {
      success: true,
      message: 'Xóa album thành công'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Delete album API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi xóa album'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

