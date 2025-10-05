import { NextResponse } from 'next/server'
import { SynologyFileStationService } from '@/lib/synology'

/**
 * Test Marketing paths
 */
export async function GET() {
  try {
    const fileStation = new SynologyFileStationService()

    // Authenticate
    const authSuccess = await fileStation.authenticate()
    
    if (!authSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed'
      }, { status: 500 })
    }

    // Test paths
    const testPaths = [
      '/Marketing',
      '/Marketing/Ninh',
      '/Marketing/Ninh/thuvienanh',
      '/volume1/Marketing',
      '/volume1/Marketing/Ninh',
      '/volume1/Marketing/Ninh/thuvienanh'
    ]

    const results: any[] = []

    for (const path of testPaths) {
      try {
        console.log(`📁 Testing path: ${path}`)
        
        const response = await fetch(`${(fileStation as any).workingUrl}/webapi/entry.cgi?` + new URLSearchParams({
          api: 'SYNO.FileStation.List',
          version: '2',
          method: 'list',
          folder_path: path,
          additional: '["real_path","perm"]',
          _sid: (fileStation as any).sessionId
        }))

        const result = await response.json()
        console.log(`   Result:`, result)

        results.push({
          path,
          success: result.success,
          error: result.error,
          files: result.data?.files?.length || 0,
          real_path: result.data?.files?.[0]?.additional?.real_path,
          perm: result.data?.files?.[0]?.additional?.perm
        })
      } catch (error) {
        results.push({
          path,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
        valid_paths: results.filter(r => r.success).map(r => r.path)
      }
    })
  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

