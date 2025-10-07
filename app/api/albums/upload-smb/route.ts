import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'
import { SMBUploadService } from '@/lib/smbUpload'
import { ApiResponse } from '@/types/database'

interface AlbumImage {
  id: string
  album_id: string
  image_id: string
  image_url: string
  image_name: string
  sort_order: number
  added_at: Date
  added_by: string | null
}

/**
 * Upload images to Synology NAS via SMB protocol
 * Path: smb://222.252.23.248/marketing/Ninh/thuvienanh
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

    console.log(`📤 Uploading ${files.length} files via SMB for album: ${album.name}`)

    const smbService = new SMBUploadService()
    const uploadedImages: AlbumImage[] = []
    const errors: string[] = []

    // SMB path: Ninh/thuvienanh/{albumId}
    // Note: SMB share is already "marketing", so we start from Ninh
    const albumFolder = `Ninh/thuvienanh/${albumId}`
    
    // Create album folder if not exists
    console.log(`📁 Creating album folder: ${albumFolder}`)
    await smbService.createDirectory('Ninh')
    await smbService.createDirectory('Ninh/thuvienanh')
    await smbService.createDirectory(albumFolder)

    // Get base URL from request
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:4000'
    const baseUrl = `${protocol}://${host}`

    // Upload each file
    for (const file of files) {
      try {
        console.log(`📤 Uploading ${file.name} (${file.size} bytes)...`)

        // Generate unique filename to avoid conflicts
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(7)
        const ext = file.name.split('.').pop()
        const uniqueFileName = `${timestamp}-${randomStr}.${ext}`
        
        // SMB file path
        const smbFilePath = `${albumFolder}/${uniqueFileName}`

        // Upload to SMB
        const uploadResult = await smbService.uploadFile(file, smbFilePath)

        if (uploadResult.success) {
          // Generate unique image ID
          const imageId = `${timestamp}-${randomStr}`

          // Create proxy URLs
          // SMB path: /marketing/Ninh/thuvienanh/{albumId}/{filename}
          const fullPath = `/marketing/Ninh/thuvienanh/${albumId}/${uniqueFileName}`
          const imageUrl = `${baseUrl}/api/synology/smb-proxy?path=${encodeURIComponent(fullPath)}`
          const thumbnailUrl = `${baseUrl}/api/synology/smb-proxy?path=${encodeURIComponent(fullPath)}&thumbnail=true`

          // Save to database
          // addImage signature: (albumId, imageUrl, caption?, imageId?)
          const albumImage = await AlbumService.addImage(
            albumId,
            imageUrl,
            file.name, // caption
            imageId
          )

          uploadedImages.push(albumImage)
          console.log(`✅ Successfully uploaded ${file.name} as ${uniqueFileName}`)
        } else {
          const errorMsg = `Failed to upload ${file.name}: ${uploadResult.error || 'Unknown error'}`
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

