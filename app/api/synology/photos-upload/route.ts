// API endpoint for uploading to Synology Photos using SYNO.FotoTeam.Upload.Item
import { NextRequest, NextResponse } from 'next/server'
import { synologyPhotosAPIService } from '@/lib/synology'
import { ApiResponse } from '@/types/database'

// POST - Upload images to Synology Photos (Shared Space)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const targetFolderId = formData.get('folderId') as string

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Không có file nào được upload'
      }, { status: 400 })
    }

    // Parse folder ID (default to 49 for testing - folder "taothu")
    const folderId = targetFolderId ? parseInt(targetFolderId) : 49

    console.log(`📤 Uploading ${files.length} files to Synology Photos (folder ID: ${folderId})`)

    // Authenticate first
    const isAuthenticated = await synologyPhotosAPIService.authenticate()
    if (!isAuthenticated) {
      return NextResponse.json({
        success: false,
        error: 'Không thể xác thực với Synology Photos API'
      }, { status: 401 })
    }

    // Upload files
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        try {
          console.log(`📸 Uploading: ${file.name} (${file.size} bytes)`)
          
          const result = await synologyPhotosAPIService.uploadFile(file, file.name, folderId)

          if (result.success && result.data) {
            console.log(`✅ Upload successful: ${file.name}`)
            return {
              filename: file.name,
              size: file.size,
              type: file.type,
              success: true,
              data: {
                id: result.data.id,
                synologyId: result.data.synologyId,
                folderId: result.data.folderId,
                url: result.data.url,
                thumbnailUrl: result.data.thumbnailUrl,
                path: result.data.path
              },
              error: undefined
            }
          } else {
            console.error(`❌ Upload failed: ${file.name}`, result.error)
            return {
              filename: file.name,
              size: file.size,
              type: file.type,
              success: false,
              data: undefined,
              error: result.error?.message || 'Upload failed'
            }
          }
        } catch (error) {
          console.error(`❌ Upload error for ${file.name}:`, error)
          return {
            filename: file.name,
            size: file.size,
            type: file.type,
            success: false,
            data: undefined,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    )

    // Count successes and failures
    const successCount = uploadResults.filter(r => r.success).length
    const failureCount = uploadResults.filter(r => !r.success).length

    console.log(`📊 Upload results: ${successCount} success, ${failureCount} failed`)

    const response: ApiResponse<typeof uploadResults> = {
      success: successCount > 0,
      data: uploadResults,
      message: `Upload hoàn tất: ${successCount} thành công, ${failureCount} thất bại`
    }

    return NextResponse.json(response, { 
      status: successCount > 0 ? 200 : 500 
    })

  } catch (error) {
    console.error('❌ Upload API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Upload thất bại'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// GET - Test connection and get folder info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId') || '49'

    console.log(`🔍 Testing Synology Photos API (folder ID: ${folderId})`)

    // Authenticate
    const isAuthenticated = await synologyPhotosAPIService.authenticate()
    
    if (!isAuthenticated) {
      return NextResponse.json({
        success: false,
        error: 'Không thể xác thực với Synology Photos API'
      }, { status: 401 })
    }

    // Return success with folder info
    const response: ApiResponse<{
      connected: boolean
      folderId: number
      message: string
    }> = {
      success: true,
      data: {
        connected: true,
        folderId: parseInt(folderId),
        message: `Kết nối thành công! Sẵn sàng upload vào folder ID: ${folderId}`
      },
      message: 'Synology Photos API ready'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Test API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test thất bại'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

