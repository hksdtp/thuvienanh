import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip Cloudflare CDN paths
  if (request.nextUrl.pathname.startsWith('/cdn-cgi/')) {
    return NextResponse.next()
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }

  // Add CORS headers to all responses
  const response = NextResponse.next()

  response.headers.set(
    'Access-Control-Allow-Origin',
    process.env.ALLOWED_ORIGIN || '*'
  )
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  )
  response.headers.set(
    'Access-Control-Allow-Credentials',
    'true'
  )

  return response
}

export const config = {
  matcher: '/api/:path*',
}
