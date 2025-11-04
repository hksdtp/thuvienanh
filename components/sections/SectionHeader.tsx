'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  overline?: string
  subtitle?: string
  viewAllHref?: string
  viewAllText?: string
  action?: ReactNode
}

export default function SectionHeader({
  title,
  overline,
  subtitle,
  viewAllHref,
  viewAllText = 'Xem tất cả',
  action
}: SectionHeaderProps) {
  return (
    <div
      className="flex items-end justify-between"
      style={{ marginBottom: 'var(--space-6)' }}
    >
      <div>
        {overline && (
          <span className="text-overline text-secondary">
            {overline}
          </span>
        )}
        <h2 className="text-title2 text-primary mt-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-body-small text-secondary mt-2">
            {subtitle}
          </p>
        )}
      </div>
      
      {(viewAllHref || action) && (
        <div>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="inline-flex items-center text-headline font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--accent-primary)' }}
            >
              {viewAllText}
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ marginLeft: 'var(--space-1)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : action}
        </div>
      )}
    </div>
  )
}

