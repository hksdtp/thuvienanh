import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'
import { synologyService } from '@/lib/synology'
import { ApiResponse, AlbumImage } from '@/types/database'

// POST /api/albums/upload-synology - Upload images to Synology NAS
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

    console.log(`📤 Uploading ${files.length} files to Synology for album: ${album.name}`)

    // Authenticate with Synology
    console.log('🔐 Authenticating with Synology...')
    const authSuccess = await synologyService.authenticate()
    if (!authSuccess) {
      console.error('❌ Synology authentication failed')
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to authenticate with Synology NAS'
      }
      return NextResponse.json(response, { status: 500 })
    }
    console.log('✅ Synology authentication successful')

    const uploadedImages: AlbumImage[] = []
    const errors: string[] = []

    // Upload to Synology Photos with folder_id = 47
    // URL: http://incanto.myds.me:6868/?launchApp=SYNO.Foto.AppInstance#/shared_space/folder/47
    const folderId = 47
    console.log(`📸 Uploading to Synology Photos folder ID: ${folderId}`)

    // Upload each file to Synology Photos
    for (const file of files) {
      try {
        console.log(`📤 Uploading ${file.name} to Synology Photos...`)
        console.log(`📊 Original file size: ${file.size} bytes, type: ${file.type}`)

        // Upload directly as File (no Buffer conversion to avoid corruption)
        const uploadResult = await synologyService.uploadToPhotos(file, file.name, folderId)

        if (uploadResult.success && uploadResult.data) {
          // Save metadata to database
          const timestamp = Date.now()
          const randomStr = Math.random().toString(36).substring(7)
          const imageId = `${timestamp}-${randomStr}`

          // Get base URL from request
          const protocol = request.headers.get('x-forwarded-proto') || 'http'
          const host = request.headers.get('host') || 'localhost:4000'
          const baseUrl = `${protocol}://${host}`

          // Use proxy URL instead of direct Synology URL
          const proxyUrl = `${baseUrl}/api/synology/image-proxy?id=${uploadResult.data.synologyId}&type=download`
          const thumbnailUrl = `${baseUrl}/api/synology/image-proxy?id=${uploadResult.data.synologyId}&type=thumbnail&size=m`

          // addImage signature: (albumId, imageUrl, caption?, imageId?)
          const albumImage = await AlbumService.addImage(
            albumId,
            proxyUrl,
            file.name, // caption
            imageId
          )

          uploadedImages.push(albumImage)
          console.log(`✅ Successfully uploaded ${file.name} to Synology`)
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

    // Return response
    if (uploadedImages.length > 0) {
      const response: ApiResponse<{ uploaded: number; images: AlbumImage[]; errors?: string[] }> = {
        success: true,
        data: {
          uploaded: uploadedImages.length,
          images: uploadedImages,
          ...(errors.length > 0 && { errors })
        },
        message: errors.length > 0
          ? `Uploaded ${uploadedImages.length} of ${files.length} images. ${errors.length} failed.`
          : `Successfully uploaded ${uploadedImages.length} images to Synology`
      }
      return NextResponse.json(response)
    } else {
      const response: ApiResponse<null> = {
        success: false,
        error: `Failed to upload all images. Errors: ${errors.join(', ')}`
      }
      return NextResponse.json(response, { status: 500 })
    }
  } catch (error) {
    console.error('Upload to Synology API error:', error)

    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Server error during upload'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

