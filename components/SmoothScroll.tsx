'use client'

import { useEffect, ReactNode, useState } from 'react'

interface SmoothScrollProps {
  children: ReactNode
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  // Render children immediately without wrapper to prevent hydration issues
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

// Parallax scroll component - Disabled to prevent hydration issues
export function ParallaxSection({
  children,
  offset = 50,
  className = ''
}: {
  children: ReactNode
  offset?: number
  className?: string
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Fade in on scroll - Disabled to prevent hydration issues
export function FadeInSection({
  children,
  className = '',
  delay = 0
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
