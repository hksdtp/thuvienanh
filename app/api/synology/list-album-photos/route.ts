import { NextRequest, NextResponse } from 'next/server'
import { synologyPhotosAPIService } from '@/lib/synology'

/**
 * API endpoint to list photos in a Synology Photos album
 * GET /api/synology/list-album-photos?albumId=20
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const albumId = searchParams.get('albumId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!albumId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Album ID is required'
        },
        { status: 400 }
      )
    }

    console.log(`📸 Listing photos from album ${albumId}...`)

    // Authenticate first
    const isAuthenticated = await synologyPhotosAPIService.authenticate()
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to authenticate with Synology Photos'
        },
        { status: 503 }
      )
    }

    // List photos in album
    const photos = await synologyPhotosAPIService.listAlbumPhotos(
      parseInt(albumId),
      limit,
      offset
    )

    return NextResponse.json({
      success: true,
      data: {
        photos,
        count: photos.length,
        albumId: parseInt(albumId),
        limit,
        offset
      }
    })

  } catch (error) {
    console.error('❌ Error listing album photos:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list album photos'
      },
      { status: 500 }
    )
  }
}

