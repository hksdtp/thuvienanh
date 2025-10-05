import { NextResponse } from 'next/server'
import { SynologyFileStationService } from '@/lib/synology'

/**
 * Test FileStation API - List folders and check permissions
 */
export async function GET() {
  try {
    const fileStation = new SynologyFileStationService()

    // Authenticate
    console.log('🔐 Authenticating with FileStation...')
    const authSuccess = await fileStation.authenticate()
    
    if (!authSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed'
      }, { status: 500 })
    }

    console.log('✅ Authentication successful')

    // Test list folders
    const testPaths = [
      '/',
      '/homes',
      '/homes/haininh',
      '/photo',
      '/photo/TVA',
      '/volume1',
      '/volume1/homes',
      '/volume1/homes/haininh'
    ]

    const results: any[] = []

    for (const path of testPaths) {
      try {
        console.log(`📁 Testing path: ${path}`)
        
        // Try to list folder
        const response = await fetch(`${(fileStation as any).workingUrl}/webapi/entry.cgi?` + new URLSearchParams({
          api: 'SYNO.FileStation.List',
          version: '2',
          method: 'list',
          folder_path: path,
          _sid: (fileStation as any).sessionId
        }))

        const result = await response.json()
        console.log(`   Result:`, result)

        results.push({
          path,
          success: result.success,
          error: result.error,
          files: result.data?.files?.length || 0
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
        summary: results.filter(r => r.success).map(r => r.path)
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

