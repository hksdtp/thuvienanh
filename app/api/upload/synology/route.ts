// API endpoint for Synology Photos upload
import { NextRequest, NextResponse } from 'next/server'
import synologyService from '@/lib/synology'
import { ApiResponse } from '@/types/database'

interface SynologyUploadResult {
  id: string
  filename: string
  url: string
  path: string
  size: number
  type: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const albumName = (formData.get('albumName') as string) || 'fabric-library'
    const category = (formData.get('category') as string) || 'fabrics'

    // Validate category
    if (!['fabrics', 'collections', 'albums', 'temp'].includes(category)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Category không hợp lệ. Chỉ chấp nhận: fabrics, collections, albums, temp'
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

    // Validate file count
    const MAX_FILES = 10
    if (files.length > MAX_FILES) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Chỉ được upload tối đa ${MAX_FILES} files cùng lúc`
      }
      return NextResponse.json(response, { status: 400 })
    }

    const uploadResults: SynologyUploadResult[] = []
    const errors: string[] = []

    // Create album path based on category and album name
    const albumPath = `${category}/${albumName}`

    // Try to create album if it doesn't exist
    try {
      await synologyService.createAlbum(albumName, category)
    } catch (error) {
      console.warn('Could not create album, it may already exist:', error)
    }

    // Test connection first
    const isConnected = await synologyService.authenticate()
    if (!isConnected) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không thể kết nối đến Synology Photos. Vui lòng kiểm tra cấu hình server.'
      }
      return NextResponse.json(response, { status: 503 })
    }

    // Process each file
    for (const file of files) {
      try {
        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`)
          continue
        }

        // Upload to Synology with retry mechanism
        let uploadResult: any = null
        let retryCount = 0
        const maxRetries = 2

        while (retryCount <= maxRetries && !uploadResult?.success) {
          try {
            uploadResult = await synologyService.uploadImage(file, albumPath)

            if (uploadResult.success && uploadResult.data) {
              uploadResults.push({
                id: uploadResult.data.id,
                filename: uploadResult.data.filename,
                url: uploadResult.data.url,
                path: uploadResult.data.path,
                size: file.size,
                type: file.type
              })
              break
            } else if (retryCount < maxRetries) {
              console.warn(`Upload attempt ${retryCount + 1} failed for ${file.name}, retrying...`)
              retryCount++
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000))
            } else {
              errors.push(`${file.name}: ${uploadResult.error?.message || 'Upload failed after retries'}`)
            }
          } catch (retryError) {
            console.error(`Retry ${retryCount + 1} error for ${file.name}:`, retryError)
            if (retryCount >= maxRetries) {
              errors.push(`${file.name}: Lỗi kết nối sau ${maxRetries + 1} lần thử`)
            }
            retryCount++
          }
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        errors.push(`${file.name}: Lỗi không xác định - ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Prepare response
    const hasSuccessfulUploads = uploadResults.length > 0
    const hasErrors = errors.length > 0

    if (hasSuccessfulUploads && !hasErrors) {
      // All uploads successful
      const response: ApiResponse<SynologyUploadResult[]> = {
        success: true,
        data: uploadResults,
        message: `Upload thành công ${uploadResults.length} file(s) lên Synology Photos`
      }
      return NextResponse.json(response, { status: 200 })
    } else if (hasSuccessfulUploads && hasErrors) {
      // Partial success
      const response: ApiResponse<SynologyUploadResult[]> = {
        success: true,
        data: uploadResults,
        message: `Upload thành công ${uploadResults.length} file(s), ${errors.length} file(s) thất bại`,
        error: errors.join('; ')
      }
      return NextResponse.json(response, { status: 207 }) // Multi-status
    } else {
      // All uploads failed
      const response: ApiResponse<null> = {
        success: false,
        error: `Tất cả uploads thất bại: ${errors.join('; ')}`
      }
      return NextResponse.json(response, { status: 400 })
    }

  } catch (error) {
    console.error('Synology upload API error:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi upload lên Synology Photos'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// File validation function
function validateFile(file: File): string | null {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ]

  if (!file.type.startsWith('image/')) {
    return 'File phải là hình ảnh'
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPEG, PNG, WebP, GIF'
  }

  if (file.size > MAX_SIZE) {
    return `File quá lớn. Kích thước tối đa: ${MAX_SIZE / (1024 * 1024)}MB`
  }

  if (file.size === 0) {
    return 'File rỗng'
  }

  return null
}

// Health check endpoint
export async function GET() {
  try {
    // Test Synology connection
    const isAuthenticated = await synologyService.authenticate()
    
    const response: ApiResponse<{ status: string, synology: boolean }> = {
      success: true,
      data: {
        status: 'healthy',
        synology: isAuthenticated
      },
      message: isAuthenticated 
        ? 'Synology Photos connection OK' 
        : 'Synology Photos connection failed'
    }
    
    return NextResponse.json(response, { 
      status: isAuthenticated ? 200 : 503 
    })
  } catch (error) {
    console.error('Synology health check error:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: 'Health check failed'
    }
    return NextResponse.json(response, { status: 500 })
  }
}
