import { NextRequest, NextResponse } from 'next/server'
import { SynologyFileStationService } from '@/lib/synology'

/**
 * API Proxy to load images from Synology File Station
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    const thumbnail = searchParams.get('thumbnail') === 'true'

    if (!filePath) {
      return NextResponse.json(
        { error: 'Missing file path' },
        { status: 400 }
      )
    }

    console.log(`🖼️ Loading image from File Station: ${filePath}`)

    const fileStation = new SynologyFileStationService()
    
    // Authenticate
    const authSuccess = await fileStation.authenticate()
    if (!authSuccess) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }

    const workingUrl = (fileStation as any).workingUrl
    const sessionId = (fileStation as any).sessionId

    // Build download URL
    const downloadUrl = `${workingUrl}/webapi/entry.cgi?` + new URLSearchParams({
      api: 'SYNO.FileStation.Download',
      version: '2',
      method: 'download',
      path: filePath,
      mode: 'download',
      _sid: sessionId
    })

    console.log(`📥 Fetching from: ${downloadUrl}`)

    // Fetch image from Synology
    const response = await fetch(downloadUrl)

    if (!response.ok) {
      console.error(`❌ File Station error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: 'Failed to fetch image from File Station' },
        { status: response.status }
      )
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // Get image buffer
    const imageBuffer = await response.arrayBuffer()
    console.log(`✅ Image fetched: ${imageBuffer.byteLength} bytes, type: ${contentType}`)

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('❌ File Station image proxy error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

