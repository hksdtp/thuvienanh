'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { 
  TrashIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'

export interface GalleryImage {
  id: string
  url: string
  originalName: string
  fileName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  uploadedAt: Date
  alt?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  onDelete?: (imageId: string) => void
  onReorder?: (images: GalleryImage[]) => void
  onSelect?: (image: GalleryImage) => void
  selectedImages?: string[]
  allowMultiSelect?: boolean
  allowDelete?: boolean
  allowReorder?: boolean
  className?: string
  columns?: number
}

export default function ImageGallery({
  images,
  onDelete,
  onReorder,
  onSelect,
  selectedImages = [],
  allowMultiSelect = false,
  allowDelete = true,
  allowReorder = false,
  className = '',
  columns = 4
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [draggedImage, setDraggedImage] = useState<GalleryImage | null>(null)

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle image click
  const handleImageClick = useCallback((image: GalleryImage, index: number) => {
    if (onSelect) {
      onSelect(image)
    } else {
      setCurrentImageIndex(index)
      setLightboxOpen(true)
    }
  }, [onSelect])

  // Handle delete
  const handleDelete = useCallback((imageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(imageId)
    }
  }, [onDelete])

  // Lightbox navigation
  const goToPrevious = useCallback(() => {
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : images.length - 1
    )
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentImageIndex(prev => 
      prev < images.length - 1 ? prev + 1 : 0
    )
  }, [images.length])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!lightboxOpen) return
    
    switch (e.key) {
      case 'ArrowLeft':
        goToPrevious()
        break
      case 'ArrowRight':
        goToNext()
        break
      case 'Escape':
        setLightboxOpen(false)
        break
    }
  }, [lightboxOpen, goToPrevious, goToNext])

  // Drag and drop handlers (for reordering)
  const handleDragStart = useCallback((e: React.DragEvent, image: GalleryImage) => {
    if (!allowReorder) return
    setDraggedImage(image)
    e.dataTransfer.effectAllowed = 'move'
  }, [allowReorder])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!allowReorder) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [allowReorder])

  const handleDrop = useCallback((e: React.DragEvent, targetImage: GalleryImage) => {
    if (!allowReorder || !draggedImage || !onReorder) return
    
    e.preventDefault()
    
    const draggedIndex = images.findIndex(img => img.id === draggedImage.id)
    const targetIndex = images.findIndex(img => img.id === targetImage.id)
    
    if (draggedIndex === targetIndex) return
    
    const newImages = [...images]
    newImages.splice(draggedIndex, 1)
    newImages.splice(targetIndex, 0, draggedImage)
    
    onReorder(newImages)
    setDraggedImage(null)
  }, [allowReorder, draggedImage, images, onReorder])

  const handleDragEnd = useCallback(() => {
    setDraggedImage(null)
  }, [])

  if (images.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <EyeIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hình ảnh</h3>
        <p className="text-gray-500">Upload hình ảnh để bắt đầu tạo gallery</p>
      </div>
    )
  }

  const currentImage = images[currentImageIndex]

  return (
    <div className={className} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Gallery Grid */}
      <div 
        className={`grid gap-4`}
        style={{ 
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` 
        }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`
              group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer
              transition-all duration-200 hover:shadow-lg
              ${selectedImages.includes(image.id) ? 'ring-2 ring-blue-500' : ''}
              ${allowReorder ? 'cursor-move' : 'cursor-pointer'}
            `}
            draggable={allowReorder}
            onDragStart={(e) => handleDragStart(e, image)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, image)}
            onDragEnd={handleDragEnd}
            onClick={() => handleImageClick(image, index)}
          >
            {/* Image */}
            <Image
              src={image.url}
              alt={image.alt || image.originalName}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes={`(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw`}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />

            {/* Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-1">
              {allowDelete && (
                <button
                  onClick={(e) => handleDelete(image.id, e)}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Xóa ảnh"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                  setLightboxOpen(true)
                }}
                className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="Xem chi tiết"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
              </button>
            </div>

            {/* File Info */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p className="text-white text-xs font-medium truncate">
                {image.originalName}
              </p>
              <p className="text-white/80 text-xs">
                {formatFileSize(image.size)}
              </p>
            </div>

            {/* Selection indicator */}
            {selectedImages.includes(image.id) && (
              <div className="absolute top-2 left-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <HeartIcon className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronLeftIcon className="w-8 h-8" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRightIcon className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center p-4">
            <Image
              src={currentImage.url}
              alt={currentImage.alt || currentImage.originalName}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Image info */}
          <div className="absolute bottom-4 left-4 right-4 text-center text-white">
            <h3 className="text-lg font-medium mb-1">{currentImage.originalName}</h3>
            <p className="text-sm text-gray-300">
              {formatFileSize(currentImage.size)} • {currentImageIndex + 1} / {images.length}
            </p>
            {currentImage.width && currentImage.height && (
              <p className="text-sm text-gray-300">
                {currentImage.width} × {currentImage.height} pixels
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
