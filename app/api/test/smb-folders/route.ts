import { NextRequest, NextResponse } from 'next/server'
import { smbService } from '@/lib/smb'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing SMB shared folders list...')
    
    const folders = await smbService.listSharedFolders()
    
    return NextResponse.json({
      success: true,
      data: folders
    })
  } catch (error) {
    console.error('❌ SMB folders test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
