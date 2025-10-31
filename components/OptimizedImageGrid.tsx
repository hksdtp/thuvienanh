'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { PhotoIcon } from '@heroicons/react/24/outline'

interface OptimizedImageGridProps {
  images: Array<{
    id: string
    image_url: string
    caption?: string | null
  }>
  onImageClick: (index: number) => void
  columns?: {
    mobile: number
    tablet: number
    desktop: number
    wide: number
  }
  aspectRatio?: 'square' | 'video' | 'portrait'
  showCaptions?: boolean
  showIndex?: boolean
  quality?: number
}

export default function OptimizedImageGrid({
  images,
  onImageClick,
  columns = { mobile: 2, tablet: 3, desktop: 4, wide: 5 },
  aspectRatio = 'square',
  showCaptions = true,
  showIndex = true,
  quality = 85
}: OptimizedImageGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Create intersection observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageId = entry.target.getAttribute('data-image-id')
            if (imageId) {
              setLoadedImages((prev) => new Set(prev).add(imageId))
              observerRef.current?.unobserve(entry.target)
            }
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01
      }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  }[aspectRatio]

  const gridCols = `grid-cols-${columns.mobile} sm:grid-cols-${columns.tablet} md:grid-cols-${columns.desktop} lg:grid-cols-${columns.wide}`

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {images.map((image, idx) => (
        <ImageGridItem
          key={image.id}
          image={image}
          index={idx}
          totalImages={images.length}
          aspectRatioClass={aspectRatioClass}
          showCaption={showCaptions}
          showIndex={showIndex}
          quality={quality}
          onClick={() => onImageClick(idx)}
          observer={observerRef.current}
          isLoaded={loadedImages.has(image.id)}
        />
      ))}
    </div>
  )
}

interface ImageGridItemProps {
  image: {
    id: string
    image_url: string
    caption?: string | null
  }
  index: number
  totalImages: number
  aspectRatioClass: string
  showCaption: boolean
  showIndex: boolean
  quality: number
  onClick: () => void
  observer: IntersectionObserver | null
  isLoaded: boolean
}

function ImageGridItem({
  image,
  index,
  totalImages,
  aspectRatioClass,
  showCaption,
  showIndex,
  quality,
  onClick,
  observer,
  isLoaded
}: ImageGridItemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (container && observer) {
      observer.observe(container)
    }

    return () => {
      if (container && observer) {
        observer.unobserve(container)
      }
    }
  }, [observer])

  return (
    <div
      ref={containerRef}
      data-image-id={image.id}
      className={`group relative ${aspectRatioClass} bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105`}
      onClick={onClick}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <PhotoIcon className="w-12 h-12 text-gray-300" />
        </div>
      )}

      {/* Placeholder before lazy load */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}

      {/* Image */}
      {isLoaded && (
        <Image
          src={image.image_url}
          alt={image.caption || `Image ${index + 1}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className={`object-cover group-hover:scale-110 transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          quality={quality}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true)
            setImageLoaded(false)
          }}
        />
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {showCaption && image.caption && (
            <p className="text-white text-xs font-medium truncate mb-1">
              {image.caption}
            </p>
          )}
          {showIndex && (
            <p className="text-white/80 text-xs">
              {index + 1} / {totalImages}
            </p>
          )}
        </div>
      </div>

      {/* Hover effect - magnifying glass icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

