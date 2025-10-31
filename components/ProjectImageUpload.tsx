'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { compressImage } from '@/lib/imageCompression'

interface UploadedImage {
  id: string
  file: File
  preview: string
  uploading?: boolean
  progress?: number
  compressing?: boolean
  originalSize?: number
  compressedSize?: number
}

interface ProjectImageUploadProps {
  projectType: 'nha-dan' | 'du-an'
  onImagesChange?: (images: File[]) => void
  maxImages?: number
  maxSizeMB?: number
}

export default function ProjectImageUpload({
  projectType,
  onImagesChange,
  maxImages = 20,
  maxSizeMB = 20
}: ProjectImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const projectTypeLabel = projectType === 'nha-dan' ? 'Nhà Dân' : 'Dự Án'

  // Helper to notify parent with valid images
  const notifyParent = useCallback((updatedImages: UploadedImage[]) => {
    const validImages = updatedImages.filter(img => !img.compressing)
    const files = validImages.map(img => img.file)
    onImagesChange?.(files)
  }, [onImagesChange])

  // Validate and compress file if needed
  const processFile = async (file: File): Promise<{ file: File; originalSize: number; compressedSize: number } | null> => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file PNG, JPG, GIF, WEBP')
      return null
    }

    if (images.length >= maxImages) {
      setError(`Tối đa ${maxImages} hình ảnh`)
      return null
    }

    const fileSizeMB = file.size / 1024 / 1024
    const originalSize = file.size

    // If file > 20MB, compress it
    if (fileSizeMB > maxSizeMB) {
      try {
        console.log(`🗜️ File ${file.name} (${fileSizeMB.toFixed(2)}MB) > ${maxSizeMB}MB, compressing...`)

        const compressed = await compressImage(file, {
          maxWidth: 2560,
          maxHeight: 2560,
          quality: 0.85,
          maxSizeMB: maxSizeMB
        })

        const compressedSizeMB = compressed.size / 1024 / 1024
        console.log(`✅ Compressed to ${compressedSizeMB.toFixed(2)}MB`)

        return {
          file: compressed,
          originalSize,
          compressedSize: compressed.size
        }
      } catch (error) {
        console.error('Compression failed:', error)
        setError(`Không thể nén file ${file.name}. Vui lòng chọn file nhỏ hơn ${maxSizeMB}MB`)
        return null
      }
    }

    return {
      file,
      originalSize,
      compressedSize: file.size
    }
  }

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return

    setError(null)
    const newImages: UploadedImage[] = []

    for (const file of Array.from(files)) {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Add placeholder with compressing state
      const placeholder: UploadedImage = {
        id,
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        progress: 0,
        compressing: file.size / 1024 / 1024 > maxSizeMB,
        originalSize: file.size
      }

      newImages.push(placeholder)
      setImages(prev => {
        const updated = [...prev, placeholder]
        // Don't notify yet - file is still compressing
        return updated
      })

      // Process file (validate + compress if needed)
      const processed = await processFile(file)

      if (processed) {
        // Update with processed file
        setImages(prev => {
          const updated = prev.map(img =>
            img.id === id
              ? {
                  ...img,
                  file: processed.file,
                  compressing: false,
                  originalSize: processed.originalSize,
                  compressedSize: processed.compressedSize
                }
              : img
          )
          // Notify parent after processing
          notifyParent(updated)
          return updated
        })
      } else {
        // Remove failed file
        setImages(prev => {
          const updated = prev.filter(img => img.id !== id)
          notifyParent(updated)
          return updated
        })
        URL.revokeObjectURL(placeholder.preview)
      }
    }
  }, [maxImages, maxSizeMB, notifyParent])

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    handleFiles(files)
  }

  // File input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  // Remove image
  const removeImage = (id: string) => {
    // Revoke object URL to free memory
    const removedImage = images.find(img => img.id === id)
    if (removedImage) {
      URL.revokeObjectURL(removedImage.preview)
    }

    setImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      notifyParent(updated)
      return updated
    })
  }

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#314158] tracking-tight">
          Hình ảnh {projectTypeLabel}
        </label>
        <span className="text-xs text-[#62748e]">
          {images.length}/{maxImages} ảnh
        </span>
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragging
            ? 'border-[#343F48] bg-[#343F48]/5'
            : 'border-gray-300 bg-white hover:border-[#343F48] hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="space-y-3">
          {/* Upload Icon */}
          <div className="flex justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          {/* Text */}
          <div className="space-y-1">
            <p className="text-base text-[#343F48] tracking-tight">
              Kéo thả hình ảnh vào đây hoặc{' '}
              <button
                type="button"
                onClick={openFilePicker}
                className="text-[#343F48] font-medium hover:underline focus:outline-none"
              >
                Chọn file
              </button>
            </p>
            <p className="text-sm text-[#62748e] tracking-tight">
              PNG, JPG, GIF, WEBP tối đa {maxSizeMB}MB (tự động nén nếu lớn hơn)
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
              >
                {/* Image */}
                <Image
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Image Number */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    #{index + 1}
                  </div>
                </div>

                {/* Compressing indicator */}
                {image.compressing && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-white text-xs font-medium">Đang nén...</p>
                  </div>
                )}

                {/* Upload Progress (if uploading) */}
                {image.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Compression info badge */}
                {image.originalSize && image.compressedSize && image.originalSize > image.compressedSize && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Nén {Math.round((1 - image.compressedSize / image.originalSize) * 100)}%
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8 text-[#90a1b9]">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-base tracking-tight">Chưa có hình ảnh nào</p>
        </div>
      )}
    </div>
  )
}

