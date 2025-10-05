'use client'

import { useState, useEffect } from 'react'
import SidebarIOS from './SidebarIOS'
import Header from './Header'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  // Fix hydration: Start with false, then set based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Desktop: auto open sidebar
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-ios-gray-50 flex">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => {}} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ios-gray-50 flex">
      {/* Sidebar */}
      <SidebarIOS open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
