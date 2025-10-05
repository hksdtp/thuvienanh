// Database health check endpoint
import { NextResponse } from 'next/server'
import { testConnection, getDatabaseStats } from '@/lib/db'

export async function GET() {
  try {
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    const stats = await getDatabaseStats()
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database health check error:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
