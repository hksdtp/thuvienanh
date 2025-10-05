'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface ImageLightboxProps {
  images: Array<{
    id: string
    image_url: string
    image_name: string
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

  useEffect(() => {
    setIndex(currentIndex)
  }, [currentIndex])

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
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, index])

  const handlePrevious = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleDelete = () => {
    if (onDelete && images[index]) {
      onDelete(images[index].id)
      // Move to next image or close if last image
      if (images.length > 1) {
        if (index === images.length - 1) {
          setIndex(index - 1)
        }
      } else {
        onClose()
      }
    }
  }

  if (!isOpen || !images[index]) return null

  const currentImage = images[index]

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors z-10"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-16 p-2 text-white hover:bg-red-600 rounded-lg transition-colors z-10"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
      )}

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors z-10"
        >
          <ChevronLeftIcon className="w-8 h-8" />
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors z-10"
        >
          <ChevronRightIcon className="w-8 h-8" />
        </button>
      )}

      {/* Image */}
      <div className="relative w-full h-full flex items-center justify-center p-16">
        <div className="relative max-w-7xl max-h-full">
          <Image
            src={currentImage.image_url}
            alt={currentImage.image_name}
            width={1920}
            height={1080}
            className="object-contain max-h-[80vh]"
            priority
          />
        </div>
      </div>

      {/* Image info */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-lg font-medium mb-1">{currentImage.image_name}</p>
        <p className="text-sm text-gray-300">
          {index + 1} / {images.length}
        </p>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  )
}

