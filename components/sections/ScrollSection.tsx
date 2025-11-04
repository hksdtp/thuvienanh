'use client'

import { ReactNode, useRef } from 'react'
import SectionHeader from './SectionHeader'

interface ScrollSectionProps {
  title: string
  overline?: string
  subtitle?: string
  viewAllHref?: string
  gap?: number
  children: ReactNode
}

export default function ScrollSection({
  title,
  overline,
  subtitle,
  viewAllHref,
  gap = 16,
  children
}: ScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="mb-12">
      <SectionHeader
        title={title}
        overline={overline}
        subtitle={subtitle}
        viewAllHref={viewAllHref}
      />
      
      <div className="relative group">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:scale-110 active:scale-95"
          style={{ marginLeft: '-20px' }}
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:scale-110 active:scale-95"
          style={{ marginRight: '-20px' }}
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ gap: `${gap}px` }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

