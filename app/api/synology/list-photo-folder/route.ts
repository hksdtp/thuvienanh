import { NextRequest, NextResponse } from 'next/server'
import { SynologyFileStationService } from '@/lib/synology'

/**
 * List contents of a folder with support for query parameter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get('folderPath') || '/photo'

    const fileStation = new SynologyFileStationService()

    // Authenticate
    const authSuccess = await fileStation.authenticate()

    if (!authSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed'
      }, { status: 500 })
    }

    console.log(`📁 Listing folder: ${folderPath}`)

    // List folder contents
    const response = await fetch(`${(fileStation as any).workingUrl}/webapi/entry.cgi?` + new URLSearchParams({
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'list',
      folder_path: folderPath,
      additional: '["real_path","size","owner","time","perm","type"]',
      _sid: (fileStation as any).sessionId
    }))

    const result = await response.json()
    console.log(`📋 Folder contents (${result.data?.total || 0} items):`, result.success ? 'Success' : result.error)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          path: folderPath,
          total: result.data.total,
          files: result.data.files.map((f: any) => ({
            name: f.name,
            path: f.path,
            isdir: f.isdir,
            additional: {
              size: f.additional?.size,
              real_path: f.additional?.real_path,
              owner: f.additional?.owner,
              perm: f.additional?.perm,
              time: f.additional?.time
            }
          }))
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

