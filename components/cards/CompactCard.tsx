'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'

interface CompactCardProps {
  title: string
  subtitle?: string
  imageUrl: string
  href: string
  icon?: ReactNode
  badge?: ReactNode
}

export default function CompactCard({
  title,
  subtitle,
  imageUrl,
  href,
  icon,
  badge
}: CompactCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 bg-white overflow-hidden transition-all duration-200 hover:bg-gray-50"
      style={{
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Image/Icon */}
      <div 
        className="relative flex-shrink-0 overflow-hidden bg-gray-100"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: 'var(--radius-md)'
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : icon ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {icon}
          </div>
        ) : null}
        
        {badge && (
          <div className="absolute top-2 right-2">
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-headline text-primary text-truncate">
          {title}
        </h4>
        
        {subtitle && (
          <p className="text-caption text-secondary mt-1 text-truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Arrow */}
      <svg 
        className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

