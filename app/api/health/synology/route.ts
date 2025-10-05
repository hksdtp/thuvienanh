// Health check endpoint for Synology Photos connection
import { NextResponse } from 'next/server'
import synologyService from '@/lib/synology'
import { ApiResponse } from '@/types/database'

export async function GET() {
  try {
    // Test Synology connection
    const isAuthenticated = await synologyService.photos.authenticate()
    
    const response: ApiResponse<{
      status: string
      synology: {
        connected: boolean
        baseUrl: string
        username: string
      }
      timestamp: string
    }> = {
      success: true,
      data: {
        status: isAuthenticated ? 'healthy' : 'degraded',
        synology: {
          connected: isAuthenticated,
          baseUrl: process.env.SYNOLOGY_BASE_URL || 'http://222.252.23.248:8888',
          username: process.env.SYNOLOGY_USERNAME || 'haininh'
        },
        timestamp: new Date().toISOString()
      },
      message: isAuthenticated 
        ? 'Synology Photos connection successful' 
        : 'Synology Photos connection failed'
    }
    
    return NextResponse.json(response, { 
      status: isAuthenticated ? 200 : 503 
    })
  } catch (error) {
    console.error('Synology health check error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      message: 'Could not connect to Synology Photos'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
