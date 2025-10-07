'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AlbumsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/albums/fabric')
  }, [router])

  return (
    <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue border-t-transparent"></div>
    </div>
  )
}
