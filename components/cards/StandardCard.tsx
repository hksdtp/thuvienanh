'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'

interface StandardCardProps {
  title: string
  description?: string
  category?: string
  imageUrl: string
  href: string
  aspectRatio?: '3/4' | '16/9' | '1/1'
  badge?: ReactNode
  footer?: ReactNode
}

export default function StandardCard({
  title,
  description,
  category,
  imageUrl,
  href,
  aspectRatio = '3/4',
  badge,
  footer
}: StandardCardProps) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden transition-all duration-300 hover-scale gpu-accelerated"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Image Container */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio,
          backgroundColor: 'var(--bg-tertiary)'
        }}
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 right-3">
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-4)' }}>
        {category && (
          <span className="text-caption text-secondary uppercase font-semibold">
            {category}
          </span>
        )}
        
        <h3 className="text-headline mt-2 text-primary">
          {title}
        </h3>
        
        {description && (
          <p className="text-body-small text-secondary mt-2 text-truncate-2">
            {description}
          </p>
        )}
        
        {footer && (
          <div
            style={{
              marginTop: 'var(--space-3)',
              paddingTop: 'var(--space-3)',
              borderTop: `1px solid var(--border-light)`
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </Link>
  )
}

