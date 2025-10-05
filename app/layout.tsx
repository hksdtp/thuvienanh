import type { Metadata } from 'next'
import './globals.css'
import AppLayout from '@/components/AppLayout'

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
      <body className="bg-gray-100 min-h-screen">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  )
}
