'use client'

import { useState, useRef, useCallback } from 'react'
import { XMarkIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'

interface UniversalUploadModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: 'fabric' | 'collection' | 'project' | 'event' | 'style' | 'accessory' | 'album'
  entityId: string
  entityName: string
  subcategory?: string
  maxFiles?: number
  acceptedFormats?: string[]
  onUploadSuccess?: (urls: string[]) => void
}

interface FileWithPreview {
  file: File
  id: string
  preview: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  url?: string
}

const ENTITY_LABELS = {
  fabric: 'Vải',
  collection: 'Bộ sưu tập',
  project: 'Công trình',
  event: 'Sự kiện',
  style: 'Phong cách',
  accessory: 'Phụ kiện',
  album: 'Album'
}

export default function UniversalUploadModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  subcategory,
  maxFiles = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  onUploadSuccess
}: UniversalUploadModalProps) {
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
        alert(`File "${file.name}" không được hỗ trợ. Chỉ chấp nhận: ${acceptedFormats.join(', ')}`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert(`File "${file.name}" quá lớn. Tối đa 10MB`)
        return false
      }
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
      status: 'pending'
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

    try {
      const formData = new FormData()
      formData.append('entityType', entityType)
      formData.append('entityId', entityId)
      formData.append('entityName', entityName)
      if (subcategory) {
        formData.append('subcategory', subcategory)
      }

      files.forEach(fileItem => {
        formData.append('files', fileItem.file)
      })

      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })))

      const response = await fetch('/api/upload/filestation', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success && result.data) {
        const urls = result.data.files.map((f: any) => f.url)
        setFiles(prev => prev.map((f, i) => ({ 
          ...f, 
          status: 'success',
          url: urls[i]
        })))
        
        if (onUploadSuccess) {
          onUploadSuccess(urls)
        }

        // Auto close after success
        setTimeout(() => {
          handleClose()
        }, 2000)
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
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    // Clean up
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
    setIsUploading(false)
    setUploadProgress(0)
    onClose()
  }

  if (!isOpen) return null

  const hasErrors = files.some(f => f.status === 'error')
  const allSuccess = files.length > 0 && files.every(f => f.status === 'success')

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30" onClick={handleClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CloudArrowUpIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Upload ảnh {ENTITY_LABELS[entityType]}
                  </h2>
                  <p className="text-sm text-gray-500">{entityName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isUploading}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all
                ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${files.length > 0 ? 'mb-4' : ''}
              `}
            >
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Kéo thả ảnh vào đây hoặc
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isUploading}
              >
                Chọn từ máy tính
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedFormats.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Hỗ trợ: JPEG, PNG, WebP • Tối đa {maxFiles} ảnh • Max 10MB/ảnh
              </p>
            </div>

            {/* Preview grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map(file => (
                  <div key={file.id} className="relative group">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    
                    {/* Status overlay */}
                    {file.status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                      </div>
                    )}
                    
                    {file.status === 'success' && (
                      <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                      </div>
                    )}
                    
                    {file.status === 'error' && (
                      <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
                      </div>
                    )}
                    
                    {/* Remove button */}
                    {file.status === 'pending' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* File name */}
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {file.file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                {files.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {files.length} ảnh đã chọn
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  disabled={isUploading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpload}
                  disabled={files.length === 0 || isUploading || allSuccess}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-all
                    ${files.length === 0 || isUploading || allSuccess
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  `}
                >
                  {isUploading ? 'Đang tải lên...' : allSuccess ? 'Hoàn thành' : 'Tải lên'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
