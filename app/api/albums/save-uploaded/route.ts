import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'

/**
 * API để lưu metadata của ảnh đã upload trực tiếp lên Synology FileStation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { albumId, files } = body

    if (!albumId || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Missing albumId or files' },
        { status: 400 }
      )
    }

    console.log(`💾 Saving ${files.length} uploaded files to database...`)

    // Verify album exists
    const album = await AlbumService.getById(albumId)

    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    const savedImages = []

    // Process each file
    for (const file of files) {
      try {
        const { name, path, size } = file

        // Generate unique image ID
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(7)
        const imageId = `${timestamp}-${randomStr}`

        // For FileStation uploads, use the file path as URL - use relative URLs to avoid Next.js Image Optimizer 503 errors
        const imageUrl = `/api/synology/file-proxy?path=${encodeURIComponent(path)}`
        const thumbnailUrl = `/api/synology/file-proxy?path=${encodeURIComponent(path)}&thumbnail=true`

        // Save to database using AlbumService
        // addImage signature: (albumId, imageUrl, caption?, imageId?)
        const albumImage = await AlbumService.addImage(
          albumId,
          imageUrl,
          name, // caption
          imageId
        )

        savedImages.push(albumImage)
        console.log(`✅ Saved: ${name} (ID: ${imageId})`)
      } catch (error) {
        console.error(`❌ Error saving ${file.name}:`, error)
      }
    }

    console.log(`✅ Saved ${savedImages.length}/${files.length} images to database`)

    return NextResponse.json({
      success: true,
      data: {
        uploaded: savedImages.length,
        images: savedImages
      }
    })
  } catch (error) {
    console.error('❌ Save uploaded error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

