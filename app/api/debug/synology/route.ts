// Debug endpoint for Synology connection testing
import { NextResponse } from 'next/server'
import { ApiResponse } from '@/types/database'

export async function GET() {
  try {
    const baseUrl = process.env.SYNOLOGY_BASE_URL || 'http://222.252.23.248:6868'
    const alternativeUrl = process.env.SYNOLOGY_ALTERNATIVE_URL || 'http://222.252.23.248:8888'
    const username = process.env.SYNOLOGY_USERNAME || 'haininh'

    // Test basic connectivity
    console.log('Testing Synology connection...')
    console.log('Primary URL:', baseUrl)
    console.log('Alternative URL:', alternativeUrl)
    console.log('Username:', username)

    // Test 1: Basic server connectivity for both URLs
    const testUrls = [baseUrl, alternativeUrl]
    let workingUrl = ''
    let serverReachable = false
    let serverErrors: string[] = []

    for (const url of testUrls) {
      try {
        console.log(`Testing ${url}...`)
        const testResponse = await fetch(`${url}/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query&query=all`, {
          method: 'GET',
          signal: AbortSignal.timeout(8000) // 8 second timeout
        })

        if (testResponse.ok) {
          serverReachable = true
          workingUrl = url
          console.log(`✅ ${url} is reachable`)
          break
        } else {
          const error = `${url}: HTTP ${testResponse.status}: ${testResponse.statusText}`
          serverErrors.push(error)
          console.log(`❌ ${error}`)
        }
      } catch (error) {
        const errorMsg = `${url}: ${error instanceof Error ? error.message : 'Unknown connection error'}`
        serverErrors.push(errorMsg)
        console.log(`❌ ${errorMsg}`)
      }
    }

    // Test 2: API Info query
    let apiInfo = null
    let apiError = ''

    if (serverReachable && workingUrl) {
      try {
        const apiResponse = await fetch(`${workingUrl}/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query&query=all`)
        apiInfo = await apiResponse.json()
      } catch (error) {
        apiError = error instanceof Error ? error.message : 'API query failed'
      }
    }

    // Test 3: Authentication test
    let authTest = null
    let authError = ''

    if (serverReachable && workingUrl) {
      try {
        const authResponse = await fetch(`${workingUrl}/webapi/auth.cgi`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            api: 'SYNO.API.Auth',
            version: '3',
            method: 'login',
            account: username,
            passwd: process.env.SYNOLOGY_PASSWORD || 'Villad24@',
            session: 'FileStation',
            format: 'sid'
          })
        })

        authTest = await authResponse.json()
      } catch (error) {
        authError = error instanceof Error ? error.message : 'Auth test failed'
      }
    }

    const response: ApiResponse<{
      server: {
        reachable: boolean
        workingUrl?: string
        testedUrls: string[]
        errors?: string[]
      }
      api: {
        available: boolean
        info?: any
        error?: string
      }
      auth: {
        tested: boolean
        result?: any
        error?: string
      }
      timestamp: string
    }> = {
      success: true,
      data: {
        server: {
          reachable: serverReachable,
          workingUrl: workingUrl || undefined,
          testedUrls: testUrls,
          errors: serverErrors.length > 0 ? serverErrors : undefined
        },
        api: {
          available: !!apiInfo,
          info: apiInfo,
          error: apiError || undefined
        },
        auth: {
          tested: !!authTest,
          result: authTest,
          error: authError || undefined
        },
        timestamp: new Date().toISOString()
      },
      message: serverReachable
        ? `Synology connection successful via ${workingUrl}`
        : `Synology server not reachable. Tested: ${testUrls.join(', ')}`
    }
    
    return NextResponse.json(response, { 
      status: serverReachable ? 200 : 503 
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    
    const response: ApiResponse<null> = {
      success: false,
      error: `Debug test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
