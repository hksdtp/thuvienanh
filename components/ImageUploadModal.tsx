'use client'

import { useState, useRef, useCallback } from 'react'
import { XMarkIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'
import { compressImage } from '@/lib/imageCompression'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: 'fabric' | 'collection' | 'project' | 'event' | 'style' | 'accessory' | 'album'
  entityId?: string
  category?: string // For accessories and albums
  maxFiles?: number
  acceptedFormats?: string[]
  onUploadSuccess?: (urls: string[]) => void
}

interface FileWithPreview {
  file: File
  id: string
  preview: string
  status: 'pending' | 'compressing' | 'uploading' | 'success' | 'error'
  error?: string
  url?: string
  originalSize?: number
  compressedSize?: number
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  category,
  maxFiles = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  onUploadSuccess
}: ImageUploadModalProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }, [])

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!acceptedFormats.includes(file.type)) {
        return false
      }
      // Remove size limit check - we'll compress large files
      return true
    })

    if (files.length + validFiles.length > maxFiles) {
      alert(`Chỉ được upload tối đa ${maxFiles} ảnh`)
      return
    }

    const filesWithPreview: FileWithPreview[] = validFiles.map(file => ({
      file: file,
      id: Math.random().toString(36).substring(7),
      preview: URL.createObjectURL(file),
      status: 'pending',
      originalSize: file.size
    }))

    setFiles(prev => [...prev, ...filesWithPreview])
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    const uploadedUrls: string[] = []

    // For albums, use batch upload to FileStation
    if (entityType === 'album' && entityId) {
      try {
        const formData = new FormData()
        formData.append('albumId', entityId)

        // Compress files > 5MB before upload
        for (let i = 0; i < files.length; i++) {
          const fileItem = files[i]
          const fileSizeMB = fileItem.file.size / 1024 / 1024

          if (fileSizeMB > 5) {
            // Show compressing status
            setFiles(prev => prev.map(f =>
              f.id === fileItem.id ? { ...f, status: 'compressing' } : f
            ))

            console.log(`🗜️ Compressing ${fileItem.file.name} (${fileSizeMB.toFixed(2)} MB)...`)

            try {
              const compressedFile = await compressImage(fileItem.file, {
                maxWidth: 1920,
                maxHeight: 1920,
                quality: 0.85,
                maxSizeMB: 5
              })

              const compressedSizeMB = compressedFile.size / 1024 / 1024
              console.log(`✅ Compressed to ${compressedSizeMB.toFixed(2)} MB`)

              // Update file with compressed version
              setFiles(prev => prev.map(f =>
                f.id === fileItem.id ? {
                  ...f,
                  file: compressedFile,
                  compressedSize: compressedFile.size,
                  status: 'pending'
                } : f
              ))

              formData.append('files', compressedFile)
            } catch (error) {
              console.error('Compression error:', error)
              // Use original file if compression fails
              formData.append('files', fileItem.file)
            }
          } else {
            formData.append('files', fileItem.file)
          }
        }

        setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })))

        const response = await fetch('/api/albums/upload-filestation', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (result.success && result.data?.images) {
          const urls = result.data.images.map((img: any) => img.image_url)
          setFiles(prev => prev.map(f => ({ ...f, status: 'success' })))
          uploadedUrls.push(...urls)
        } else {
          throw new Error(result.error || 'Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        setFiles(prev => prev.map(f => ({
          ...f,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        })))
      }
    } else {
      // For other entity types, upload one by one
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i]

        try {
          let fileToUpload = fileItem.file
          const fileSizeMB = fileItem.file.size / 1024 / 1024

          // Compress if > 5MB
          if (fileSizeMB > 5) {
            setFiles(prev => prev.map(f =>
              f.id === fileItem.id ? { ...f, status: 'compressing' } : f
            ))

            console.log(`🗜️ Compressing ${fileItem.file.name} (${fileSizeMB.toFixed(2)} MB)...`)

            try {
              fileToUpload = await compressImage(fileItem.file, {
                maxWidth: 1920,
                maxHeight: 1920,
                quality: 0.85,
                maxSizeMB: 5
              })

              const compressedSizeMB = fileToUpload.size / 1024 / 1024
              console.log(`✅ Compressed to ${compressedSizeMB.toFixed(2)} MB`)

              setFiles(prev => prev.map(f =>
                f.id === fileItem.id ? {
                  ...f,
                  compressedSize: fileToUpload.size
                } : f
              ))
            } catch (error) {
              console.error('Compression error:', error)
              // Use original file if compression fails
            }
          }

          setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, status: 'uploading' } : f
          ))

          const formData = new FormData()
          formData.append('file', fileToUpload)
          if (entityId) formData.append('entityId', entityId)
          if (category) formData.append('category', category)

          const response = await fetch(`/api/upload/${entityType}`, {
            method: 'POST',
            body: formData
          })

          const result = await response.json()

          if (result.success) {
            setFiles(prev => prev.map(f =>
              f.id === fileItem.id ? { ...f, status: 'success', url: result.data.url } : f
            ))
            uploadedUrls.push(result.data.url)
          } else {
            throw new Error(result.error || 'Upload failed')
          }
        } catch (error) {
          console.error('Upload error:', error)
          setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' } : f
          ))
        }

        setUploadProgress(((i + 1) / files.length) * 100)
      }
    }

    setIsUploading(false)

    if (uploadedUrls.length > 0 && onUploadSuccess) {
      onUploadSuccess(uploadedUrls)
    }

    // Auto close after 2 seconds if all successful
    if (uploadedUrls.length === files.length) {
      setTimeout(() => {
        handleClose()
      }, 2000)
    }
  }

  const handleClose = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
    setUploadProgress(0)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-macos-border-light">
          <h2 className="text-xl font-semibold text-macos-text-primary">
            Upload Ảnh
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-ios-gray-50 rounded-lg transition-colors"
            disabled={isUploading}
          >
            <XMarkIcon className="w-5 h-5 text-macos-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Drop Zone */}
          {files.length < maxFiles && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-ios-blue bg-blue-50'
                  : 'border-macos-border-light hover:border-ios-blue hover:bg-ios-gray-50'
              }`}
            >
              <CloudArrowUpIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-lg font-medium text-macos-text-primary mb-2">
                Kéo thả ảnh vào đây hoặc click để chọn
              </p>
              <p className="text-sm text-macos-text-secondary">
                Hỗ trợ JPG, PNG, WebP. Tối đa {maxFiles} ảnh
              </p>
              <p className="text-xs text-macos-text-tertiary mt-1">
                Ảnh &gt; 5MB sẽ tự động nén trước khi upload
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedFormats.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Preview Grid */}
          {files.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-macos-text-secondary mb-3">
                {files.length} ảnh đã chọn
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map(file => (
                  <div key={file.id} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-ios-gray-50 border border-macos-border-light">
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Status Overlay */}
                      {file.status === 'compressing' && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mb-2"></div>
                          <span className="text-xs text-white font-medium">Nén ảnh...</span>
                        </div>
                      )}

                      {file.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mb-2"></div>
                          <span className="text-xs text-white font-medium">Đang tải...</span>
                        </div>
                      )}

                      {file.status === 'success' && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <CheckCircleIcon className="w-12 h-12 text-green-600" />
                        </div>
                      )}

                      {file.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                          <ExclamationCircleIcon className="w-12 h-12 text-red-600" />
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    {file.status === 'pending' && !isUploading && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}

                    {/* Filename & Size Info */}
                    <div className="mt-2">
                      <p className="text-xs text-macos-text-secondary truncate">
                        {file.file.name}
                      </p>
                      {file.originalSize && (
                        <p className="text-xs text-macos-text-tertiary mt-1">
                          {(file.originalSize / 1024 / 1024).toFixed(2)} MB
                          {file.compressedSize && file.compressedSize < file.originalSize && (
                            <span className="text-green-600 ml-1">
                              → {(file.compressedSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-macos-text-primary">
                  Đang upload...
                </span>
                <span className="text-sm text-macos-text-secondary">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-ios-gray-200 rounded-full h-2">
                <div
                  className="bg-ios-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-macos-border-light">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-macos-text-secondary hover:bg-ios-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="px-6 py-2 text-sm font-medium text-white bg-ios-blue hover:bg-ios-blue-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Đang upload...' : `Upload ${files.length} ảnh`}
          </button>
        </div>
      </div>
    </div>
  )
}

