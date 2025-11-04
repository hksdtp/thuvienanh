'use client'

import { ReactNode } from 'react'
import SectionHeader from './SectionHeader'

interface GridSectionProps {
  title: string
  overline?: string
  subtitle?: string
  viewAllHref?: string
  columns?: 2 | 3 | 4
  gap?: number
  children: ReactNode
}

export default function GridSection({
  title,
  overline,
  subtitle,
  viewAllHref,
  columns = 4,
  gap = 16, // Default 16px = var(--space-4)
  children
}: GridSectionProps) {
  return (
    <section style={{ marginBottom: 'var(--space-12)' }}>
      <SectionHeader
        title={title}
        overline={overline}
        subtitle={subtitle}
        viewAllHref={viewAllHref}
      />
      
      <div 
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`
        }}
      >
        {children}
      </div>
      
      <style jsx>{`
        @media (max-width: 1024px) {
          .grid {
            grid-template-columns: repeat(${Math.min(columns, 3)}, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: repeat(${Math.min(columns, 2)}, 1fr) !important;
          }
        }
        
        @media (max-width: 480px) {
          .grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}

