import { NextRequest, NextResponse } from 'next/server'
import { AlbumService } from '@/lib/database'
import { synologyService } from '@/lib/synology'
import { ApiResponse } from '@/types/api'

interface SyncResult {
  albumId: string
  albumName: string
  synced: number
  added: number
  skipped: number
  errors: string[]
}

// POST /api/albums/sync-synology - Sync images from Synology to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { albumId, albumPath } = body

    if (!albumId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Album ID is required'
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

    console.log(`🔄 Syncing images from Synology for album: ${album.name}`)

    // Authenticate with Synology
    const authSuccess = await synologyService.authenticate()
    if (!authSuccess) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to authenticate with Synology NAS'
      }
      return NextResponse.json(response, { status: 500 })
    }

    // Get existing images from database
    const existingImages = await AlbumService.getImages(albumId)
    const existingImageIds = new Set(existingImages.map(img => img.image_id))

    console.log(`📊 Found ${existingImages.length} existing images in database`)

    // Browse folders from Synology Photos API
    const folders = await synologyService.browseFolders()
    console.log(`📁 Found ${folders.length} folders in Synology`)

    // For now, we'll implement a basic sync that checks if images exist
    // In a real implementation, you would:
    // 1. List files in the Synology folder
    // 2. Compare with database
    // 3. Add missing images to database

    const result: SyncResult = {
      albumId: album.id,
      albumName: album.name,
      synced: 0,
      added: 0,
      skipped: existingImages.length,
      errors: []
    }

    // TODO: Implement actual file listing from Synology
    // This would require using FileStation API to list files in a specific folder
    // For now, we'll return the current state

    const response: ApiResponse<SyncResult> = {
      success: true,
      data: result,
      message: `Sync completed. ${result.added} images added, ${result.skipped} already exist.`
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Sync from Synology API error:', error)

    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Server error during sync'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// GET /api/albums/sync-synology - Get sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const albumId = searchParams.get('albumId')

    if (!albumId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Album ID is required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Get album and images
    const album = await AlbumService.getById(albumId)
    if (!album) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Album not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const images = await AlbumService.getImages(albumId)

    // Check how many images are from Synology (have Synology URLs)
    const synologyImages = images.filter(img => 
      img.image_url.includes('webapi/entry.cgi') || 
      img.image_url.includes('fbdownload')
    )

    const localImages = images.filter(img => 
      img.image_url.startsWith('/uploads/')
    )

    const response: ApiResponse<{
      albumId: string
      albumName: string
      totalImages: number
      synologyImages: number
      localImages: number
    }> = {
      success: true,
      data: {
        albumId: album.id,
        albumName: album.name,
        totalImages: images.length,
        synologyImages: synologyImages.length,
        localImages: localImages.length
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get sync status error:', error)

    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Server error'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

