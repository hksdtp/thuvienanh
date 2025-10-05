import { NextResponse } from 'next/server'
import { SynologyPhotosAPIService } from '@/lib/synology'

/**
 * API để lấy Synology session cho client-side upload
 * Client sẽ dùng session này để upload trực tiếp lên Synology
 */
export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      data: {
        workingUrl,
        sessionId: fileStationSessionId
      }
    })
  } catch (error) {
    console.error('❌ Get session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

