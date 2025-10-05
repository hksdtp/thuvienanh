// API endpoint để xóa files đã upload
import { NextRequest, NextResponse } from 'next/server'
import { deleteUploadedFile } from '@/lib/upload'
import { ApiResponse } from '@/types/database'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Thiếu thông tin đường dẫn file'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate file path (security check)
    if (!filePath.startsWith('/uploads/')) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Đường dẫn file không hợp lệ'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Delete file
    const deleted = await deleteUploadedFile(filePath)

    if (deleted) {
      const response: ApiResponse<{ deleted: boolean }> = {
        success: true,
        data: { deleted: true },
        message: 'Xóa file thành công'
      }
      return NextResponse.json(response)
    } else {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không thể xóa file'
      }
      return NextResponse.json(response, { status: 500 })
    }

  } catch (error) {
    console.error('Delete file API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi xóa file'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// POST endpoint để xóa nhiều files cùng lúc
export async function POST(request: NextRequest) {
  try {
    const { filePaths } = await request.json()

    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Danh sách file không hợp lệ'
      }
      return NextResponse.json(response, { status: 400 })
    }

    const results = {
      deleted: [] as string[],
      failed: [] as string[]
    }

    // Delete each file
    for (const filePath of filePaths) {
      // Validate file path
      if (!filePath.startsWith('/uploads/')) {
        results.failed.push(filePath)
        continue
      }

      try {
        const deleted = await deleteUploadedFile(filePath)
        if (deleted) {
          results.deleted.push(filePath)
        } else {
          results.failed.push(filePath)
        }
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error)
        results.failed.push(filePath)
      }
    }

    const response: ApiResponse<typeof results> = {
      success: true,
      data: results,
      message: `Xóa thành công ${results.deleted.length}/${filePaths.length} files`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Bulk delete API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi xóa files'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
