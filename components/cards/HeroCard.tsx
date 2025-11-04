'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'

interface HeroCardProps {
  title: string
  subtitle?: string
  category?: string
  imageUrl: string
  href: string
  ctaText?: string
  gradient?: 'bottom' | 'top' | 'both'
  children?: ReactNode
}

export default function HeroCard({
  title,
  subtitle,
  category,
  imageUrl,
  href,
  ctaText,
  gradient = 'bottom',
  children
}: HeroCardProps) {
  return (
    <Link
      href={href}
      className="group relative block w-full overflow-hidden transition-all duration-300 hover-lift gpu-accelerated"
      style={{
        height: '650px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>

      {/* Gradient Overlay */}
      {(gradient === 'bottom' || gradient === 'both') && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 50%)'
          }}
        />
      )}
      
      {(gradient === 'top' || gradient === 'both') && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 30%)'
          }}
        />
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
        {category && (
          <span className="text-overline opacity-80 mb-2 block">
            {category}
          </span>
        )}
        
        <h2 className="text-title1 mb-3 text-shadow-lg">
          {title}
        </h2>
        
        {subtitle && (
          <p className="text-body opacity-90 mb-4 max-w-2xl text-shadow">
            {subtitle}
          </p>
        )}
        
        {ctaText && (
          <button className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-headline font-semibold transition-all duration-200 hover:bg-white/30 hover:scale-105 active:scale-95">
            {ctaText}
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {children}
      </div>
    </Link>
  )
}

