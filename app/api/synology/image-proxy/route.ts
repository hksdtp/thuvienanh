import { NextRequest, NextResponse } from 'next/server'
import { SynologyService } from '@/lib/synology'

/**
 * API Proxy để load ảnh từ Synology Photos
 * Giải quyết vấn đề session ID hết hạn và CORS
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageId = searchParams.get('id')
    const type = searchParams.get('type') || 'download' // 'download' or 'thumbnail'
    const size = searchParams.get('size') || 'm' // 'sm', 'm', 'xl'

    if (!imageId) {
      return NextResponse.json(
        { error: 'Missing image ID' },
        { status: 400 }
      )
    }

    console.log(`🖼️ Proxying ${type} request for image ID: ${imageId}`)

    // Initialize Synology service
    const synology = new SynologyService()
    await synology.authenticate()

    // Get item info to retrieve cache_key
    console.log(`🔍 Getting item info for ID: ${imageId}`)
    const itemInfo = await synology.getItemInfo(parseInt(imageId))

    if (!itemInfo || !itemInfo.additional?.thumbnail?.cache_key) {
      console.error(`❌ Cannot get cache_key for image ID: ${imageId}`)
      return NextResponse.json(
        { error: 'Cannot get image cache_key. Image may still be indexing.' },
        { status: 404 }
      )
    }

    const cacheKey = itemInfo.additional.thumbnail.cache_key
    console.log(`✅ Got cache_key: ${cacheKey}`)

    // Build API URL based on type
    // Note: Use thumbnail API for both thumbnail and download
    // because SYNO.Foto.Download requires additional permissions
    let apiUrl: string
    const thumbnailSize = type === 'thumbnail' ? size : 'xl' // Use 'xl' for full-size images

    apiUrl = `${synology.getWorkingUrl()}/photo/webapi/entry.cgi?` +
      `api=SYNO.Foto.Thumbnail&method=get&version=1&` +
      `id=${imageId}&size=${thumbnailSize}&type=unit&` +
      `cache_key=${encodeURIComponent(cacheKey)}&_sid=${synology.getSessionId()}`

    console.log(`📥 Fetching from: ${apiUrl}`)

    // Fetch image from Synology
    const response = await fetch(apiUrl)

    if (!response.ok) {
      console.error(`❌ Synology API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: 'Failed to fetch image from Synology' },
        { status: response.status }
      )
    }

    // Check if response is actually an image
    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
      console.error(`❌ Invalid content type: ${contentType}`)
      const text = await response.text()
      console.error(`Response body: ${text}`)
      return NextResponse.json(
        { error: 'Invalid image response', contentType, body: text },
        { status: 500 }
      )
    }

    // Get image buffer
    const imageBuffer = await response.arrayBuffer()
    console.log(`✅ Image fetched: ${imageBuffer.byteLength} bytes, type: ${contentType}`)

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('❌ Image proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

