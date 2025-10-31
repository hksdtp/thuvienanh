import { NextRequest, NextResponse } from 'next/server'
import { SynologyFileStationService } from '@/lib/synology'

/**
 * API proxy để load files từ Synology FileStation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get('path')
    const thumbnail = searchParams.get('thumbnail') === 'true'

    if (!filePath) {
      console.error('❌ Missing file path parameter')
      return NextResponse.json(
        { error: 'Missing file path' },
        { status: 400 }
      )
    }

    console.log(`📁 Proxying file request: ${filePath} (thumbnail: ${thumbnail})`)

    // Initialize Synology FileStation service
    const synology = new SynologyFileStationService()

    // Add timeout for authentication (15s to allow for concurrent requests)
    const authPromise = synology.authenticate()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Authentication timeout')), 15000)
    )

    const authSuccess = await Promise.race([authPromise, timeoutPromise]) as boolean

    if (!authSuccess) {
      console.error('❌ Failed to authenticate with Synology FileStation')
      return NextResponse.json(
        { error: 'Failed to authenticate with Synology FileStation' },
        { status: 503 }
      )
    }

    const workingUrl = synology.getWorkingUrl()
    const sessionId = synology.getSessionId()

    if (!workingUrl || !sessionId) {
      console.error('❌ Failed to get Synology FileStation session')
      return NextResponse.json(
        { error: 'Failed to get Synology FileStation session' },
        { status: 503 }
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

    // Fetch file from Synology with timeout
    const fetchPromise = fetch(apiUrl, {
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    const response = await fetchPromise

    if (!response.ok) {
      console.error(`❌ Synology returned status: ${response.status}`)
      const text = await response.text()
      console.error(`Response: ${text}`)
      return NextResponse.json(
        { error: 'Failed to fetch file from Synology', details: text },
        { status: response.status }
      )
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    // Stream the file back to client
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()

    console.log(`✅ File proxy success: ${filePath} (${(buffer.byteLength / 1024).toFixed(2)} KB)`)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error) {
    console.error('❌ File proxy error:', error)

    // More detailed error messages
    let errorMessage = 'Internal server error'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout - Synology server not responding'
        statusCode = 504
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to Synology server'
        statusCode = 503
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: statusCode }
    )
  }
}

