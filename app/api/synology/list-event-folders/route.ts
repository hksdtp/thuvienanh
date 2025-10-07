import { NextRequest, NextResponse } from 'next/server'
import { SynologyFileStationService } from '@/lib/synology'
import { ApiResponse } from '@/types/database'

// Path to event photos archive on Synology
const EVENT_ARCHIVE_PATH = '/Marketing/3. ẢNH SỰ KIỆN (KH + NỘI BỘ 2017-NAY)'

interface EventFolder {
  name: string
  path: string
  imageCount?: number
  coverImage?: string
}

export async function GET(request: NextRequest) {
  try {
    console.log('📁 Listing event folders from:', EVENT_ARCHIVE_PATH)

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

    // List folders in the archive path
    const { folders } = await fileStation.listFolder(EVENT_ARCHIVE_PATH)

    // For each folder, get the first image as cover
    const eventFolders: EventFolder[] = await Promise.all(
      folders.map(async (folder) => {
        try {
          // List files in this folder
          const { files } = await fileStation.listFolder(folder.path)
          
          // Filter image files
          const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
          )

          // Get first image as cover
          let coverImage: string | undefined
          if (imageFiles.length > 0) {
            const firstImage = imageFiles[0]
            // Generate Next.js proxy URL for the image
            // Use relative URL to work with both localhost and production
            coverImage = `/synology-proxy?path=${encodeURIComponent(firstImage.path)}`
          }

          return {
            name: folder.name,
            path: folder.path,
            imageCount: imageFiles.length,
            coverImage
          }
        } catch (error) {
          console.error(`Error processing folder ${folder.name}:`, error)
          return {
            name: folder.name,
            path: folder.path,
            imageCount: 0
          }
        }
      })
    )

    // Sort folders by name
    eventFolders.sort((a, b) => a.name.localeCompare(b.name))

    const response: ApiResponse<EventFolder[]> = {
      success: true,
      data: eventFolders,
      message: `Found ${eventFolders.length} event folders`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error listing event folders:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}

