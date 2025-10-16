import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const width = parseInt(searchParams.get('w') || '800')
    const height = parseInt(searchParams.get('h') || '0')
    const quality = parseInt(searchParams.get('q') || '75')
    const format = searchParams.get('f') || 'webp'

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Fetch the original image
    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
    }

    const buffer = await response.arrayBuffer()
    
    // Process image with sharp
    let sharpInstance = sharp(Buffer.from(buffer))
    
    // Resize if width is specified
    if (width > 0) {
      sharpInstance = sharpInstance.resize(width, height || undefined, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    // Convert format and optimize
    let optimizedBuffer: Buffer
    
    switch(format) {
      case 'webp':
        optimizedBuffer = await sharpInstance
          .webp({ quality })
          .toBuffer()
        break
      case 'avif':
        optimizedBuffer = await sharpInstance
          .avif({ quality })
          .toBuffer()
        break
      case 'jpg':
      case 'jpeg':
        optimizedBuffer = await sharpInstance
          .jpeg({ quality, progressive: true })
          .toBuffer()
        break
      case 'png':
        optimizedBuffer = await sharpInstance
          .png({ quality, compressionLevel: 9 })
          .toBuffer()
        break
      default:
        optimizedBuffer = await sharpInstance
          .webp({ quality })
          .toBuffer()
    }

    // Return optimized image with proper headers
    return new NextResponse(optimizedBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': `image/${format}`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Optimized': 'true',
      },
    })
  } catch (error) {
    console.error('Image optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize image' },
      { status: 500 }
    )
  }
}

// Generate blur placeholder
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
    }

    const buffer = await response.arrayBuffer()
    
    // Generate tiny blur placeholder
    const placeholder = await sharp(Buffer.from(buffer))
      .resize(20, 20, { fit: 'inside' })
      .blur(5)
      .webp({ quality: 20 })
      .toBuffer()
    
    // Convert to base64 data URL
    const base64 = placeholder.toString('base64')
    const dataUrl = `data:image/webp;base64,${base64}`
    
    return NextResponse.json({ 
      placeholder: dataUrl,
      originalUrl: url 
    })
  } catch (error) {
    console.error('Placeholder generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate placeholder' },
      { status: 500 }
    )
  }
}
