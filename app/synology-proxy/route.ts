import { NextRequest, NextResponse } from 'next/server'
import { SynologyFileStationService } from '@/lib/synology'

// Cache session để tránh authenticate mỗi lần
let cachedSession: {
  sessionId: string
  workingUrl: string
  expiresAt: number
} | null = null

const SESSION_CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

async function getOrCreateSession() {
  const now = Date.now()

  // Kiểm tra cache còn valid không
  if (cachedSession && cachedSession.expiresAt > now) {
    console.log('✅ Using cached Synology session')
    return cachedSession
  }

  console.log('🔄 Creating new Synology session...')
  const fileStation = new SynologyFileStationService()

  const authSuccess = await fileStation.authenticate()
  if (!authSuccess) {
    throw new Error('Synology authentication failed')
  }

  const sessionId = (fileStation as any).sessionId
  const workingUrl = (fileStation as any).workingUrl

  if (!sessionId || !workingUrl) {
    throw new Error('Missing session ID or working URL')
  }

  // Cache session
  cachedSession = {
    sessionId,
    workingUrl,
    expiresAt: now + SESSION_CACHE_DURATION
  }

  console.log('✅ New Synology session created and cached')
  return cachedSession
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return new NextResponse('Missing path parameter', { status: 400 })
    }

    console.log('📥 Proxying Synology file:', filePath)

    // Get or create session (with caching)
    let session
    try {
      session = await getOrCreateSession()
    } catch (error) {
      console.error('❌ Session error:', error)
      // Nếu session fail, thử clear cache và retry 1 lần
      cachedSession = null
      try {
        session = await getOrCreateSession()
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError)
        return new NextResponse('Authentication failed', { status: 500 })
      }
    }

    // Construct download URL
    const downloadUrl = `${session.workingUrl}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(filePath)}&mode=download&_sid=${session.sessionId}`

    // Fetch the file from Synology
    const response = await fetch(downloadUrl)

    if (!response.ok) {
      // Nếu 401/403, có thể session hết hạn, clear cache
      if (response.status === 401 || response.status === 403) {
        console.log('⚠️ Session expired, clearing cache...')
        cachedSession = null
      }
      console.error('❌ Failed to download file:', response.status, response.statusText)
      return new NextResponse('Failed to download file', { status: response.status })
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    // Stream the file back to client
    const fileBuffer = await response.arrayBuffer()

    console.log('✅ File downloaded:', filePath, `(${(fileBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'CDN-Cache-Control': 'public, max-age=31536000',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
      },
    })

  } catch (error) {
    console.error('❌ Error proxying Synology file:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Unknown error',
      { status: 500 }
    )
  }
}

