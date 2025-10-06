// API endpoint for Synology Photos API testing and operations
import { NextRequest, NextResponse } from 'next/server'
import { synologyPhotosAPIService } from '@/lib/synology'
import { ApiResponse } from '@/types/database'

// GET - Test connection and list folders/albums
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'test'

    console.log(`📸 Synology Photos API request: ${action}`)

    switch (action) {
      case 'test':
        // Test connection
        const isAuthenticated = await synologyPhotosAPIService.authenticate()
        
        const response: ApiResponse<{
          connected: boolean
          message: string
        }> = {
          success: isAuthenticated,
          data: {
            connected: isAuthenticated,
            message: isAuthenticated 
              ? 'Kết nối Synology Photos API thành công' 
              : 'Không thể kết nối đến Synology Photos API'
          }
        }
        
        return NextResponse.json(response, { 
          status: isAuthenticated ? 200 : 503 
        })

      case 'folders':
        // List personal folders
        const folders = await synologyPhotosAPIService.browseFolders()
        
        return NextResponse.json({
          success: true,
          data: {
            folders,
            count: folders.length
          },
          message: `Tìm thấy ${folders.length} thư mục`
        })

      case 'shared-folders':
        // List shared folders
        const sharedFolders = await synologyPhotosAPIService.browseSharedFolders()
        
        return NextResponse.json({
          success: true,
          data: {
            folders: sharedFolders,
            count: sharedFolders.length
          },
          message: `Tìm thấy ${sharedFolders.length} thư mục chia sẻ`
        })

      case 'albums':
        // List albums
        const albums = await synologyPhotosAPIService.browseAlbums()
        
        return NextResponse.json({
          success: true,
          data: {
            albums,
            count: albums.length
          },
          message: `Tìm thấy ${albums.length} albums`
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: test, folders, shared-folders, or albums'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Synology Photos API error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// POST - Upload to Synology Photos
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    // Support both folderId and albumName
    let folderId: number | undefined
    const folderIdParam = formData.get('folderId')
    const albumNameParam = formData.get('albumName')

    if (folderIdParam) {
      folderId = parseInt(folderIdParam as string)
    } else if (albumNameParam) {
      // If albumName is provided, try to parse it as folderId
      const parsed = parseInt(albumNameParam as string)
      if (!isNaN(parsed)) {
        folderId = parsed
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Không có file nào được upload'
      }, { status: 400 })
    }

    console.log(`📤 Uploading ${files.length} files to Synology Photos${folderId ? ` (folder ID: ${folderId})` : ' (root folder)'}`)

    // Use FileStation API instead of Photos API (more reliable)
    const { synologyService } = await import('@/lib/synology')

    const isAuthenticated = await synologyService.authenticate()
    if (!isAuthenticated) {
      return NextResponse.json({
        success: false,
        error: 'Không thể xác thực với Synology'
      }, { status: 401 })
    }

    // Upload files using FileStation API
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        try {
          const result = await synologyService.fileStation.uploadFile(
            file,
            '/marketing/Ninh/thuvienanh'  // Default path
          )

          if (result.success) {
            return {
              filename: file.name,
              size: file.size,
              type: file.type,
              success: true,
              data: {
                id: Date.now().toString(),
                synologyId: Date.now(),
                folderId: 0,
                url: result.data?.url || '',
                thumbnailUrl: result.data?.url || '',
              },
              error: undefined
            }
          } else {
            return {
              filename: file.name,
              size: file.size,
              type: file.type,
              success: false,
              data: undefined,
              error: result.error
            }
          }
        } catch (error) {
          return {
            filename: file.name,
            size: file.size,
            type: file.type,
            success: false,
            data: undefined,
            error: { code: -1, message: error instanceof Error ? error.message : 'Upload failed' }
          }
        }
      })
    )

    // Transform results to match UploadResult format expected by FileUpload component
    const successFiles = uploadResults
      .filter(r => r.success && r.data)
      .map(r => ({
        id: r.data!.id.toString(),
        originalName: r.filename,
        fileName: r.filename,
        url: r.data!.url || r.data!.thumbnailUrl || '',
        thumbnailUrl: r.data!.thumbnailUrl,
        synologyId: r.data!.synologyId,
        folderId: r.data!.folderId,
        mimeType: r.type,
        size: r.size,
        uploadedAt: new Date()
      }))

    const errorFiles = uploadResults
      .filter(r => !r.success)
      .map(r => ({
        file: r.filename,
        error: r.error?.message || 'Upload failed'
      }))

    const successCount = successFiles.length
    const failCount = errorFiles.length

    return NextResponse.json({
      success: successCount > 0,
      data: {
        success: successFiles,
        errors: errorFiles
      },
      message: `Upload hoàn tất: ${successCount} thành công, ${failCount} thất bại`
    })

  } catch (error) {
    console.error('❌ Upload error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi upload'
    }, { status: 500 })
  }
}

