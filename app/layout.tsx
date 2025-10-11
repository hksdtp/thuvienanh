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
    <html lang="vi">
      <body className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
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
