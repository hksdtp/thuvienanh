// API endpoint for SMB upload
import { NextRequest, NextResponse } from 'next/server'
import smbService from '@/lib/smb'
import { ApiResponse } from '@/types/database'

interface SMBUploadResult {
  id: string
  filename: string
  path: string
  url: string
  size: number
  type: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const targetPath = (formData.get('targetPath') as string) || '/marketing/Ninh/taomoi'
    const category = (formData.get('category') as string) || 'fabrics'

    console.log(`📤 SMB Upload request: ${files.length} files to ${targetPath}`)

    // Validate files
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

    const uploadResults: SMBUploadResult[] = []
    const errors: string[] = []

    // Test SMB connection first
    const connectionStatus = await smbService.getConnectionStatus()
    if (!connectionStatus.connected) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Không thể kết nối đến SMB server: ${connectionStatus.error || 'Connection failed'}`
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

        console.log(`📤 Uploading ${file.name} to SMB...`)

        // Upload to SMB (retry logic is handled in smbService.uploadFile)
        try {
          const uploadResult = await smbService.uploadFile(file, targetPath)

          if (uploadResult.success && uploadResult.data) {
            uploadResults.push({
              id: uploadResult.data.id,
              filename: uploadResult.data.filename,
              path: uploadResult.data.path,
              url: uploadResult.data.url,
              size: file.size,
              type: file.type
            })
            console.log(`✅ SMB upload successful: ${file.name}`)
          } else {
            errors.push(`${file.name}: ${uploadResult.error?.message || 'Upload failed'}`)
          }
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError)
          errors.push(`${file.name}: Lỗi kết nối - ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
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
      const response: ApiResponse<SMBUploadResult[]> = {
        success: true,
        data: uploadResults,
        message: `Upload thành công ${uploadResults.length} file(s) lên SMB server (${targetPath})`
      }
      return NextResponse.json(response, { status: 200 })
    } else if (hasSuccessfulUploads && hasErrors) {
      // Partial success
      const response: ApiResponse<SMBUploadResult[]> = {
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
    console.error('SMB upload API error:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: 'Lỗi server khi upload lên SMB server'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  try {
    console.log('🔍 SMB Health check...')
    
    // Test SMB connection
    const connectionStatus = await smbService.getConnectionStatus()
    
    const response: ApiResponse<{ status: string, smb: boolean, error?: string }> = {
      success: connectionStatus.connected,
      data: {
        status: connectionStatus.connected ? 'healthy' : 'unhealthy',
        smb: connectionStatus.connected,
        error: connectionStatus.error
      },
      message: connectionStatus.connected 
        ? 'SMB server connection OK' 
        : `SMB server connection failed: ${connectionStatus.error}`
    }
    
    return NextResponse.json(response, { 
      status: connectionStatus.connected ? 200 : 503 
    })
  } catch (error) {
    console.error('SMB health check error:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: 'Health check failed'
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
