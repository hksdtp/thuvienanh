'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect mobile screen size
 * Returns false on server-side to prevent hydration mismatch
 */
export function useIsMobile(breakpoint: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  // Return false on server-side and before mount to prevent hydration mismatch
  return mounted ? isMobile : false
}

