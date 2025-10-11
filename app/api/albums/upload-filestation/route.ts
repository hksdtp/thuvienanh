import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'
import { ApiResponse } from '@/types/database'
import { createFolderName } from '@/lib/utils'

interface AlbumImage {
  id: string
  album_id: string
  image_id: string | null
  image_url: string
  caption?: string | null
  display_order: number
  added_at: Date
  added_by: string
}

/**
 * Upload images to Synology FileStation
 * Đơn giản, ổn định, không bị corrupt file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const albumId = formData.get('albumId') as string
    const files = formData.getAll('files') as File[]

    if (!albumId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Album ID is required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (!files || files.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'No files provided'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Verify album exists
    const album = await AlbumService.getById(albumId)
    if (!album) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Album not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    console.log(`📤 Uploading ${files.length} files to Synology FileStation for album: ${album.name}`)

    // Import FileStation service
    const { SynologyFileStationService } = await import('@/lib/synology')
    const fileStation = new SynologyFileStationService()

    // Authenticate
    console.log('🔐 Authenticating with FileStation...')
    const authSuccess = await fileStation.authenticate()
    if (!authSuccess) {
      console.error('❌ FileStation authentication failed')
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to authenticate with Synology FileStation'
      }
      return NextResponse.json(response, { status: 500 })
    }
    console.log('✅ FileStation authentication successful')

    const uploadedImages: AlbumImage[] = []
    const errors: string[] = []

    // Destination path in FileStation - use same logic as when creating album
    // Use category_path if available, otherwise map category to path
    let categoryPath = ''
    if (album.category === 'fabric') {
      categoryPath = 'fabrics/general' // Default for fabric category
    } else if (album.category === 'event') {
      categoryPath = 'events'
    } else if (album.category === 'accessory') {
      categoryPath = 'accessories'
    } else {
      categoryPath = album.category || 'other'
    }
    
    const folderName = createFolderName(album.name, albumId)
    const destinationPath = `/Marketing/Ninh/thuvienanh/${categoryPath}/${folderName}`
    console.log(`📁 Uploading to: ${destinationPath}`)
    console.log(`   Category: "${album.category}", Path: "${categoryPath}", Album: "${album.name}" => Folder: "${folderName}"`)

    // Get base URL from request
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:4000'
    const baseUrl = `${protocol}://${host}`

    // Upload each file
    for (const file of files) {
      try {
        console.log(`📤 Uploading ${file.name} (${file.size} bytes)...`)

        // Upload to FileStation
        const uploadResult = await fileStation.uploadFile(file, destinationPath)

        if (uploadResult.success && uploadResult.data) {
          // Generate unique image ID
          const timestamp = Date.now()
          const randomStr = Math.random().toString(36).substring(7)
          const imageId = `${timestamp}-${randomStr}`

          // File is uploaded with original name to destinationPath
          // Path: /Marketing/Ninh/thuvienanh/{albumId}/{filename}
          const filePath = `${destinationPath}/${file.name}`

          // Create proxy URLs
          const imageUrl = `${baseUrl}/api/synology/file-proxy?path=${encodeURIComponent(filePath)}`
          const thumbnailUrl = `${baseUrl}/api/synology/file-proxy?path=${encodeURIComponent(filePath)}&thumbnail=true`

          // Save to database
          const albumImage = await AlbumService.addImage(
            albumId,
            imageUrl,
            file.name, // caption
            imageId
          )

          uploadedImages.push(albumImage)
          console.log(`✅ Successfully uploaded ${file.name}`)
        } else {
          const errorMsg = `Failed to upload ${file.name}: ${uploadResult.error?.message || 'Unknown error'}`
          console.error(`❌ ${errorMsg}`)
          errors.push(errorMsg)
        }
      } catch (error) {
        const errorMsg = `Error uploading ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`✅ Upload complete: ${uploadedImages.length}/${files.length} files uploaded`)

    if (errors.length > 0) {
      console.log(`⚠️ Errors: ${errors.join(', ')}`)
    }

    const response: ApiResponse<{ uploaded: number; images: AlbumImage[]; errors?: string[] }> = {
      success: uploadedImages.length > 0,
      data: {
        uploaded: uploadedImages.length,
        images: uploadedImages,
        ...(errors.length > 0 && { errors })
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Upload API error:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

