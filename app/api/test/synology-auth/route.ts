import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const baseUrl = process.env.SYNOLOGY_BASE_URL || 'http://222.252.23.248:8888'
    const username = process.env.SYNOLOGY_USERNAME || 'haininh'
    const password = process.env.SYNOLOGY_PASSWORD || 'Villad24@'

    console.log('🔍 Testing Synology authentication...')
    console.log(`Base URL: ${baseUrl}`)
    console.log(`Username: ${username}`)
    console.log(`Password length: ${password.length}`)

    const response = await fetch(`${baseUrl}/webapi/auth.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api: 'SYNO.API.Auth',
        version: '6',
        method: 'login',
        account: username,
        passwd: password,
        session: 'FileStation',
        format: 'sid'
      })
    })

    const data = await response.json()

    return NextResponse.json({
      success: data.success || false,
      baseUrl,
      username,
      passwordLength: password.length,
      response: data
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

