'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface ImageLightboxProps {
  images: Array<{
    id: string
    image_url: string
    caption?: string | null
  }>
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onDelete?: (imageId: string) => void
}

export default function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onDelete
}: ImageLightboxProps) {
  const [index, setIndex] = useState(currentIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setIndex(currentIndex)
    resetZoom()
    setImageLoaded(false)
    setImageError(false)
  }, [currentIndex])

  useEffect(() => {
    if (!isOpen) {
      resetZoom()
      setImageLoaded(false)
      setImageError(false)
    }
  }, [isOpen])

  // Preload adjacent images for faster navigation
  useEffect(() => {
    if (!isOpen || images.length <= 1) return

    const preloadImage = (url: string) => {
      const img = new Image()
      img.src = url
    }

    // Preload next and previous images
    const nextIndex = (index + 1) % images.length
    const prevIndex = (index - 1 + images.length) % images.length

    if (images[nextIndex]) preloadImage(images[nextIndex].image_url)
    if (images[prevIndex]) preloadImage(images[prevIndex].image_url)
  }, [index, images, isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
        case '_':
          handleZoomOut()
          break
        case '0':
          resetZoom()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, index, scale])

  const resetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handlePrevious = useCallback(() => {
    setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    resetZoom()
    setImageLoaded(false)
    setImageError(false)
  }, [images.length, resetZoom])

  const handleNext = useCallback(() => {
    setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    resetZoom()
    setImageLoaded(false)
    setImageError(false)
  }, [images.length, resetZoom])

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.5, 1)
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 })
      }
      return newScale
    })
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }, [handleZoomIn, handleZoomOut])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [scale, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, scale, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDelete = useCallback(() => {
    if (onDelete && images[index]) {
      onDelete(images[index].id)
      if (images.length > 1) {
        if (index === images.length - 1) {
          setIndex(index - 1)
        }
      } else {
        onClose()
      }
    }
  }, [onDelete, images, index, onClose])

  const handleDownload = useCallback(async () => {
    const currentImage = images[index]
    if (!currentImage) return

    try {
      const response = await fetch(currentImage.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = currentImage.caption || `image-${index + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }, [images, index])

  if (!isOpen || !images[index]) return null

  const currentImage = images[index]

  return (
    <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-md flex flex-col animate-fadeIn">
      {/* Top toolbar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4">
          {/* Left: Image info */}
          <div className="flex items-center gap-4 text-white">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
              <p className="text-sm font-medium">
                {index + 1} / {images.length}
              </p>
            </div>
            {currentImage.caption && (
              <p className="text-sm font-medium max-w-md truncate">
                {currentImage.caption}
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full p-1">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 1}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Thu nhỏ"
              >
                <MagnifyingGlassMinusIcon className="w-5 h-5" />
              </button>
              <span className="text-white text-sm font-medium px-2 min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 5}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Phóng to"
              >
                <MagnifyingGlassPlusIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2.5 text-white hover:bg-white/20 rounded-full transition-all bg-white/10 backdrop-blur-md"
              aria-label="Tải xuống"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>

            {/* Delete */}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2.5 text-white hover:bg-red-600/80 rounded-full transition-all bg-white/10 backdrop-blur-md"
                aria-label="Xóa ảnh"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2.5 text-white hover:bg-white/20 rounded-full transition-all bg-white/10 backdrop-blur-md"
              aria-label="Đóng"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main image area */}
      <div
        ref={imageContainerRef}
        className="flex-1 flex items-center justify-center overflow-hidden px-4 sm:px-8 md:px-12 lg:px-20 py-16"
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full max-w-4xl max-h-[80vh] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl animate-pulse flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-white/60 text-sm font-medium">Đang tải ảnh...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <PhotoIcon className="w-24 h-24 text-white/40 mx-auto mb-4" />
              <p className="text-white/80 text-lg font-medium">Không thể tải ảnh</p>
              <button
                onClick={() => {
                  setImageError(false)
                  setImageLoaded(false)
                }}
                className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Main image */}
        <div
          className={`relative w-full h-full flex items-center justify-center transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out, opacity 0.3s ease-out'
          }}
        >
          <img
            ref={imageRef}
            src={currentImage.image_url}
            alt={currentImage.caption || 'Image'}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain'
            }}
            className="select-none rounded-lg shadow-2xl"
            draggable={false}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(false)
            }}
          />
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/20 rounded-full transition-all duration-200 z-10 hover:scale-110 bg-white/10 backdrop-blur-md"
            aria-label="Ảnh trước"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/20 rounded-full transition-all duration-200 z-10 hover:scale-110 bg-white/10 backdrop-blur-md"
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && showThumbnails && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-2 p-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setIndex(idx)
                    resetZoom()
                  }}
                  className={`
                    relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200
                    ${idx === index
                      ? 'ring-2 ring-white scale-110'
                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                    }
                  `}
                >
                  <img
                    src={img.image_url}
                    alt={img.caption || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close (only when not zoomed) */}
      {scale === 1 && (
        <div
          className="absolute inset-0 -z-10"
          onClick={onClose}
          aria-label="Đóng lightbox"
        />
      )}
    </div>
  )
}

