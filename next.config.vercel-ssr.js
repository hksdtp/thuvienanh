/** @type {import('next').NextConfig} */
const nextConfig = {
  // No static export - use Vercel serverless for pages
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  // Exclude API routes from build (they're on VPS)
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        // Redirect all /api/* requests to VPS
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/:path*`,
        },
      ],
    }
  },
}

module.exports = nextConfig

