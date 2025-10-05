import { NextRequest, NextResponse } from 'next/server';
import { smbService } from '@/lib/smb';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 SMB Health check endpoint called...');
    
    // Test SMB connection
    const status = await smbService.getConnectionStatus();
    
    console.log('📊 SMB Status:', status);
    
    return NextResponse.json({
      success: true,
      data: {
        status: status.connected ? 'healthy' : 'disconnected',
        smb: status.connected,
        lastCheck: new Date().toISOString(),
        details: status
      }
    });
  } catch (error) {
    console.error('❌ SMB Health check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        status: 'error',
        smb: false,
        lastCheck: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
