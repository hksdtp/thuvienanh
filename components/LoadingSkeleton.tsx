'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  count?: number
}

export default function LoadingSkeleton({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = 20,
  count = 1,
}: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]'
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  }

  const skeletonElements = Array.from({ length: count }, (_, i) => (
    <motion.div
      key={i}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        ease: 'linear',
        repeat: Infinity,
      }}
    />
  ))

  return <>{skeletonElements}</>
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <LoadingSkeleton variant="rectangular" height={200} className="mb-4" />
      <LoadingSkeleton variant="text" height={24} width="75%" />
      <LoadingSkeleton variant="text" height={16} count={2} className="mb-2" />
      <div className="flex items-center justify-between pt-2">
        <LoadingSkeleton variant="text" height={12} width={60} />
        <LoadingSkeleton variant="circular" height={24} width={24} />
      </div>
    </div>
  )
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
