import { NextResponse } from 'next/server'
import { SynologyFileStationService } from '@/lib/synology'

/**
 * Create folder in FileStation
 */
export async function POST(request: Request) {
  try {
    const { path, name } = await request.json()
    
    const fileStation = new SynologyFileStationService()

    // Authenticate
    const authSuccess = await fileStation.authenticate()
    
    if (!authSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed'
      }, { status: 500 })
    }

    console.log(`📁 Creating folder: ${path}/${name}`)

    // Create folder
    const response = await fetch(`${(fileStation as any).workingUrl}/webapi/entry.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api: 'SYNO.FileStation.CreateFolder',
        version: '2',
        method: 'create',
        folder_path: path,
        name: name,
        force_parent: 'true',
        _sid: (fileStation as any).sessionId
      })
    })

    const result = await response.json()
    console.log('📋 Create folder result:', JSON.stringify(result, null, 2))

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
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

