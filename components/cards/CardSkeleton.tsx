'use client'

interface CardSkeletonProps {
  variant?: 'hero' | 'standard' | 'compact'
  aspectRatio?: '3/4' | '16/9' | '1/1'
}

export default function CardSkeleton({ 
  variant = 'standard',
  aspectRatio = '3/4'
}: CardSkeletonProps) {
  if (variant === 'hero') {
    return (
      <div 
        className="w-full overflow-hidden skeleton"
        style={{
          height: '650px',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-3">
          <div className="h-3 w-24 bg-white/20 rounded" />
          <div className="h-10 w-3/4 bg-white/20 rounded" />
          <div className="h-5 w-1/2 bg-white/20 rounded" />
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div 
        className="flex items-center gap-4 p-4 bg-white"
        style={{
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div 
          className="flex-shrink-0 skeleton"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-md)'
          }}
        />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 skeleton rounded" />
          <div className="h-4 w-1/2 skeleton rounded" />
        </div>
      </div>
    )
  }

  // Standard card
  return (
    <div 
      className="bg-white overflow-hidden"
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div 
        className="skeleton"
        style={{ aspectRatio }}
      />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 skeleton rounded" />
        <div className="h-5 w-full skeleton rounded" />
        <div className="h-4 w-3/4 skeleton rounded" />
      </div>
    </div>
  )
}

