import { NextRequest, NextResponse } from 'next/server'
import SMB2 from '@marsaud/smb2'
import sharp from 'sharp'

/**
 * Proxy to serve files from Synology NAS via SMB
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get('path')
    const thumbnail = searchParams.get('thumbnail') === 'true'

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    console.log(`📥 SMB Proxy: ${filePath}${thumbnail ? ' (thumbnail)' : ''}`)

    // SMB configuration
    const smbConfig = {
      share: `\\\\${process.env.SMB_HOST || '222.252.23.248'}\\${process.env.SMB_SHARE || 'marketing'}`,
      domain: process.env.SMB_DOMAIN || 'WORKGROUP',
      username: process.env.SMB_USERNAME || 'haininh',
      password: process.env.SMB_PASSWORD || 'Villad24@',
      port: parseInt(process.env.SMB_PORT || '445'),
      autoCloseTimeout: 10000
    }

    // Remove leading /marketing/ from path since it's already in the share
    const cleanPath = filePath.replace(/^\/marketing\//i, '')

    return new Promise<NextResponse>((resolve) => {
      const smb2Client = new SMB2(smbConfig)

      smb2Client.readFile(cleanPath, (err?: Error, data?: Buffer) => {
        smb2Client.disconnect()

        if (err || !data) {
          console.error('❌ SMB read error:', err)
          resolve(NextResponse.json(
            { error: 'File not found or access denied' },
            { status: 404 }
          ))
          return
        }

        console.log(`✅ SMB read successful: ${data.length} bytes`)

        // If thumbnail requested, resize image
        if (thumbnail) {
          sharp(data)
            .resize(300, 300, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer()
            .then((thumbnailBuffer) => {
              resolve(new NextResponse(thumbnailBuffer, {
                headers: {
                  'Content-Type': 'image/jpeg',
                  'Cache-Control': 'public, max-age=31536000, immutable'
                }
              }))
            })
            .catch((error) => {
              console.error('❌ Thumbnail generation error:', error)
              // Return original if thumbnail fails
              resolve(new NextResponse(data, {
                headers: {
                  'Content-Type': getContentType(filePath),
                  'Cache-Control': 'public, max-age=31536000, immutable'
                }
              }))
            })
        } else {
          // Return original file
          resolve(new NextResponse(data, {
            headers: {
              'Content-Type': getContentType(filePath),
              'Cache-Control': 'public, max-age=31536000, immutable'
            }
          }))
        }
      })
    })
  } catch (error) {
    console.error('❌ SMB proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()
  
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon'
  }

  return mimeTypes[ext || ''] || 'application/octet-stream'
}

