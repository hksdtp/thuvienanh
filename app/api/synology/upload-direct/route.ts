import { NextRequest, NextResponse } from 'next/server'
import { SynologyPhotosAPIService } from '@/lib/synology'

/**
 * API proxy để upload file lên Synology FileStation
 * Parse FormData, thay session ID, rồi upload
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 Direct upload proxy request received')

    // Get Synology session
    const synology = new SynologyPhotosAPIService()
    const authSuccess = await synology.authenticate()

    if (!authSuccess) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Synology' },
        { status: 500 }
      )
    }

    const workingUrl = synology.getWorkingUrl()
    const fileStationSessionId = synology.getFileStationSessionId()

    if (!workingUrl || !fileStationSessionId) {
      return NextResponse.json(
        { error: 'Failed to get Synology FileStation session' },
        { status: 500 }
      )
    }

    console.log(`🔑 Using FileStation session: ${fileStationSessionId.substring(0, 10)}...`)

    // Parse FormData từ request
    const formData = await request.formData()

    // Thay session ID bằng FileStation session
    formData.set('_sid', fileStationSessionId)

    const file = formData.get('file') as File
    console.log(`📦 Uploading file: ${file?.name} (${file?.size} bytes)`)
    console.log(`📋 Destination: ${formData.get('path')}`)

    // Forward to Synology FileStation
    const uploadUrl = `${workingUrl}/webapi/entry.cgi`

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    console.log('📋 Synology response:', result)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
      })
    } else {
      console.error('❌ Synology error:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Upload failed'
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('❌ Upload proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

