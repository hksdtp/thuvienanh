// API endpoint cho upload files
import { NextRequest, NextResponse } from 'next/server'
import { 
  validateFile, 
  saveUploadedFile, 
  MAX_FILES_PER_UPLOAD,
  UploadResult,
  UploadError,
  UploadedFile
} from '@/lib/upload'
import { ApiResponse } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const category = (formData.get('category') as string) || 'temp'

    // Validate category
    if (!['fabrics', 'collections', 'temp'].includes(category)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Category không hợp lệ. Chỉ chấp nhận: fabrics, collections, temp'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check if files exist
    if (!files || files.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không có file nào được upload'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check max files limit
    if (files.length > MAX_FILES_PER_UPLOAD) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Chỉ được upload tối đa ${MAX_FILES_PER_UPLOAD} files cùng lúc`
      }
      return NextResponse.json(response, { status: 400 })
    }

    const result: UploadResult = {
      success: [],
      errors: []
    }

    // Process each file
    for (const file of files) {
      try {
        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          result.errors.push({
            file: file.name,
            error: validationError
          })
          continue
        }

        // Save file
        const uploadedFile = await saveUploadedFile(file, category as any)
        result.success.push(uploadedFile)

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        result.errors.push({
          file: file.name,
          error: error instanceof Error ? error.message : 'Lỗi không xác định'
        })
      }
    }

    // Return results
    const response: ApiResponse<UploadResult> = {
      success: true,
      data: result,
      message: `Upload thành công ${result.success.length}/${files.length} files`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Upload API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi upload files'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// GET endpoint để lấy thông tin file đã upload
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'temp'
    
    // Validate category
    if (!['fabrics', 'collections', 'temp'].includes(category)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Category không hợp lệ'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // TODO: Implement file listing from database or filesystem
    // For now, return empty array
    const response: ApiResponse<UploadedFile[]> = {
      success: true,
      data: [],
      message: 'Danh sách files trống'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get files API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi lấy danh sách files'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
