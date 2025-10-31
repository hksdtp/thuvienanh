import type { Metadata } from 'next'
import './globals.css'
import AppLayout from '@/components/AppLayout'
import PageTransition from '@/components/PageTransition'
import SmoothScroll from '@/components/SmoothScroll'

export const metadata: Metadata = {
  title: 'Thư Viện Ảnh VẢI',
  description: 'Hệ thống quản lý thư viện ảnh vải cho Marketing và Sales',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://thuvienanh.ninh.app" />
        <link rel="dns-prefetch" href="https://thuvienanh.ninh.app" />
        <link rel="preconnect" href="http://222.252.23.248:8888" />
        <link rel="dns-prefetch" href="http://222.252.23.248:8888" />

        {/* Disable Cloudflare RUM if causing issues */}
        <meta name="cf-2fa-verify" content="false" />
      </head>
      <body className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen" suppressHydrationWarning>
        <SmoothScroll>
          <PageTransition>
            <AppLayout>
              {children}
            </AppLayout>
          </PageTransition>
        </SmoothScroll>
      </body>
    </html>
  )
}
