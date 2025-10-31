import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR || '/data/Ninh/projects/thuvienanh'

/**
 * GET /api/uploads/local/[...path]
 * Serve static files from Ubuntu Server local storage
 * 
 * Example: GET /api/uploads/local/fabrics/moq/1234567890-abc123.jpg
 * Maps to: /data/Ninh/projects/thuvienanh/fabrics/moq/1234567890-abc123.jpg
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path
    
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid path'
      }, { status: 400 })
    }

    // Construct file path
    const filePath = join(UPLOAD_BASE_DIR, ...pathSegments)

    // Security: prevent directory traversal
    if (!filePath.startsWith(UPLOAD_BASE_DIR)) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 })
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(filePath)

    // Determine content type
    const ext = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'gif':
        contentType = 'image/gif'
        break
    }

    // Return file with caching headers
    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('File serve error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

