import { NextRequest, NextResponse } from 'next/server'
import { SynologyPhotosAPIService } from '@/lib/synology'

/**
 * API proxy để load files từ Synology FileStation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get('path')
    const thumbnail = searchParams.get('thumbnail') === 'true'

    if (!filePath) {
      return NextResponse.json(
        { error: 'Missing file path' },
        { status: 400 }
      )
    }

    console.log(`📁 Proxying file request: ${filePath} (thumbnail: ${thumbnail})`)

    // Initialize Synology service
    const synology = new SynologyPhotosAPIService()
    const authSuccess = await synology.authenticate()

    if (!authSuccess) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Synology' },
        { status: 500 }
      )
    }

    const workingUrl = synology.getWorkingUrl()
    const sessionId = synology.getSessionId()

    if (!workingUrl || !sessionId) {
      return NextResponse.json(
        { error: 'Failed to get Synology session' },
        { status: 500 }
      )
    }

    // Build download URL
    let apiUrl: string

    if (thumbnail) {
      // Get thumbnail (not implemented yet, fallback to full image)
      apiUrl = `${workingUrl}/webapi/entry.cgi?` +
        `api=SYNO.FileStation.Download&version=2&method=download&` +
        `path=${encodeURIComponent(filePath)}&mode=download&_sid=${sessionId}`
    } else {
      // Get full file
      apiUrl = `${workingUrl}/webapi/entry.cgi?` +
        `api=SYNO.FileStation.Download&version=2&method=download&` +
        `path=${encodeURIComponent(filePath)}&mode=download&_sid=${sessionId}`
    }

    console.log(`🔗 Fetching from: ${apiUrl.replace(sessionId, '***')}`)

    // Fetch file from Synology
    const response = await fetch(apiUrl)

    if (!response.ok) {
      console.error(`❌ Synology returned status: ${response.status}`)
      const text = await response.text()
      console.error(`Response: ${text}`)
      return NextResponse.json(
        { error: 'Failed to fetch file from Synology' },
        { status: response.status }
      )
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    // Stream the file back to client
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('❌ File proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

