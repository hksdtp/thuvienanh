import { NextRequest, NextResponse } from 'next/server'
import { SynologyFileStationService } from '@/lib/synology'
import { ApiResponse } from '@/types/database'

interface EventImage {
  name: string
  path: string
  url: string
  size?: number
  time?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get('path')

    if (!folderPath) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Folder path is required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    console.log('📁 Listing images from folder:', folderPath)

    const fileStation = new SynologyFileStationService()
    
    // Authenticate
    const authSuccess = await fileStation.authenticate()
    if (!authSuccess) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to authenticate with Synology'
      }
      return NextResponse.json(response, { status: 500 })
    }

    // List files in the folder
    const { files } = await fileStation.listFolder(folderPath)

    // Filter image files
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
    )

    // Generate proxy URLs for images
    // Use relative URL to work with both localhost and production
    const eventImages: EventImage[] = imageFiles.map(file => ({
      name: file.name,
      path: file.path,
      url: `/synology-proxy?path=${encodeURIComponent(file.path)}`,
      size: file.additional?.size,
      time: file.additional?.time?.mtime
    }))

    // Sort by name
    eventImages.sort((a, b) => a.name.localeCompare(b.name))

    const response: ApiResponse<EventImage[]> = {
      success: true,
      data: eventImages,
      message: `Found ${eventImages.length} images`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error listing event images:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

