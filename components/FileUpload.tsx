'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { useToast } from './Toast'
import { compressImages } from '@/lib/imageCompression'

export interface UploadedFile {
  id: string
  originalName: string
  fileName: string
  url: string
  mimeType: string
  size: number
  uploadedAt: Date
}

export interface UploadError {
  file: string
  error: string
}

export interface UploadResult {
  success: UploadedFile[]
  errors: UploadError[]
}

interface FileUploadProps {
  category?: 'fabrics' | 'collections' | 'temp' | 'albums'
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  onUploadComplete?: (result: UploadResult) => void
  onUploadStart?: () => void
  onUploadProgress?: (progress: number) => void
  selectedAlbumId?: string // Album để thêm ảnh vào sau khi upload
  albumName?: string // Tên album cho Synology
  onAlbumNameChange?: (name: string) => void // Callback khi album name thay đổi
  useSynology?: boolean // Sử dụng Synology Photos thay vì local storage
  className?: string
  disabled?: boolean
}

interface FileWithPreview extends File {
  id: string
  preview?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  uploadedFile?: UploadedFile
}

export default function FileUpload({
  category = 'temp',
  maxFiles = 10,
  maxFileSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  onUploadComplete,
  onUploadStart,
  onUploadProgress,
  selectedAlbumId,
  albumName,
  onAlbumNameChange,
  useSynology = false,
  className = '',
  disabled = false
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [storageType] = useState<'synology-photos'>('synology-photos')
  const [synologyConnected, setSynologyConnected] = useState(false)
  const [synologyStatus, setSynologyStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking')
  const [compressionStats, setCompressionStats] = useState<{
    original: number
    compressed: number
    reduction: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { warning, ToastContainer } = useToast()

  // Test Synology Photos API connection via API route (server-side)
  const testSynologyConnection = useCallback(async () => {
    setSynologyStatus('checking')
    try {
      // Call Next.js API route instead of direct Synology API
      const response = await fetch('/api/synology/photos?action=test')
      const data = await response.json()

      const connected = data.success && data.data?.connected
      setSynologyConnected(connected)
      setSynologyStatus(connected ? 'connected' : 'disconnected')
    } catch (error) {
      console.error('Synology Photos API connection test failed:', error)
      setSynologyConnected(false)
      setSynologyStatus('error')
    }
  }, [])

  // Test connection on mount
  useEffect(() => {
    testSynologyConnection()
  }, [testSynologyConnection])

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Định dạng không được hỗ trợ. Chỉ chấp nhận: ${acceptedTypes.join(', ')}`
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File quá lớn. Kích thước tối đa: ${maxFileSize}MB`
    }
    
    return null
  }, [acceptedTypes, maxFileSize])

  // Add files to list
  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: FileWithPreview[] = []
    
    for (const file of newFiles) {
      // Check if file already exists
      if (files.some(f => f.name === file.name && f.size === file.size)) {
        continue
      }
      
      // Validate file
      const error = validateFile(file)
      
      const fileWithPreview: FileWithPreview = Object.assign(file, {
        id: `${Date.now()}-${Math.random()}`,
        preview: URL.createObjectURL(file),
        status: (error ? 'error' : 'pending') as 'error' | 'pending' | 'uploading' | 'success',
        error: error || undefined
      })
      
      validFiles.push(fileWithPreview)
    }
    
    // Check total files limit
    const totalFiles = files.length + validFiles.length
    if (totalFiles > maxFiles) {
      const allowedCount = maxFiles - files.length
      validFiles.splice(allowedCount)
    }
    
    setFiles(prev => [...prev, ...validFiles])
  }, [files, validateFile, maxFiles])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    addFiles(selectedFiles)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addFiles])

  // Handle drag events
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
    addFiles(droppedFiles)
  }, [addFiles])

  // Remove file from list
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }, [])

  // Upload files
  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setCompressionStats(null)
    onUploadStart?.()

    try {
      // STEP 1: Compress images
      console.log('🗜️ Compressing images...')
      const originalSize = pendingFiles.reduce((sum, f) => sum + f.size, 0)

      const compressedFiles = await compressImages(
        pendingFiles,
        {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          quality: 0.8
        },
        (current, total) => {
          const compressionProgress = (current / total) * 20
          setUploadProgress(compressionProgress)
          onUploadProgress?.(compressionProgress)
        }
      )

      const compressedSize = compressedFiles.reduce((sum, f) => sum + f.size, 0)
      const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)

      setCompressionStats({
        original: originalSize,
        compressed: compressedSize,
        reduction: parseFloat(reduction)
      })

      console.log('✅ Compression complete!')
      console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`)
      console.log(`   Compressed: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`)
      console.log(`   Reduction: ${reduction}%`)

      // STEP 2: Prepare FormData
      const formData = new FormData()

      compressedFiles.forEach(file => {
        formData.append('files', file)
      })

      formData.append('category', category)

      if (albumName) {
        formData.append('albumName', albumName)
      }

      // Update file status to uploading
      setFiles(prev => prev.map(f =>
        pendingFiles.some(pf => pf.id === f.id)
          ? { ...f, status: 'uploading' }
          : f
      ))

      // STEP 3: Upload to Synology
      const uploadEndpoint = '/api/synology/photos'
      formData.append('storageType', 'synology-photos')

      console.log('📤 Uploading to Synology...')
      setUploadProgress(20)

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        const uploadResult: UploadResult = result.data

        // Update file status based on results
        setFiles(prev => prev.map(file => {
          const successFile = uploadResult.success.find(s => s.originalName === file.name)
          const errorFile = uploadResult.errors.find(e => e.file === file.name)

          if (successFile) {
            return {
              ...file,
              status: 'success',
              uploadedFile: successFile
            }
          } else if (errorFile) {
            return {
              ...file,
              status: 'error',
              error: errorFile.error
            }
          }
          return file
        }))

        setUploadProgress(100)
        onUploadProgress?.(100)
        onUploadComplete?.(uploadResult)

        console.log('✅ Upload complete!')
      } else {
        throw new Error(result.error || 'Upload failed')
      }

    } catch (error) {
      console.error('❌ Upload error:', error)

      // Mark all uploading files as error
      setFiles(prev => prev.map(f =>
        f.status === 'uploading'
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ))
    } finally {
      setIsUploading(false)
    }
  }, [files, category, albumName, onUploadStart, onUploadProgress, onUploadComplete])

  // Clear all files
  const clearFiles = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
    setUploadProgress(0)
  }, [files])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const pendingFiles = files.filter(f => f.status === 'pending')
  const hasValidFiles = pendingFiles.length > 0

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Storage Type - Fixed to Synology Photos API */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Lưu trữ</h3>
        <div className="flex">
          <div className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg border border-teal-500 bg-teal-50 text-teal-700 text-sm font-medium">
            <PhotoIcon className="w-5 h-5 mr-2" />
            Synology Photos API
          </div>
        </div>

        {/* Connection Status */}
        <div className="text-sm">
          {/* Synology Status */}
          {synologyStatus === 'checking' && (
            <div className="flex items-center text-yellow-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
              Đang kiểm tra kết nối...
            </div>
          )}
          {synologyStatus === 'connected' && (
            <div className="flex items-center text-green-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Synology Photos API đã kết nối
            </div>
          )}
          {(synologyStatus === 'disconnected' || synologyStatus === 'error') && (
            <div className="flex items-center text-red-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Không thể kết nối Synology Photos API
            </div>
          )}
        </div>
      </div>

      {/* Folder ID for Synology Photos */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Folder ID (tùy chọn)
        </label>
        <input
          type="text"
          value={albumName || ''}
          onChange={(e) => onAlbumNameChange?.(e.target.value)}
          placeholder="Để trống để upload vào thư mục gốc"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          disabled={disabled}
        />
        <p className="text-xs text-gray-500">
          Nhập Folder ID nếu muốn upload vào thư mục cụ thể. Xem folder ID trong trang test.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-900">
            Kéo thả files vào đây hoặc click để chọn
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Hỗ trợ: {acceptedTypes.join(', ')} • Tối đa {maxFiles} files • {maxFileSize}MB/file
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Files đã chọn ({files.length})
            </h3>
            <button
              onClick={clearFiles}
              className="text-xs text-gray-500 hover:text-gray-700"
              disabled={isUploading}
            >
              Xóa tất cả
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* Preview */}
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                  {file.preview ? (
                    <Image
                      src={file.preview}
                      alt={file.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PhotoIcon className="w-full h-full text-gray-400 p-2" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {file.status === 'success' && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                  {file.status === 'uploading' && (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {file.status === 'pending' && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={isUploading}
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compression Stats */}
      {compressionStats && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-sm text-green-800">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Đã nén ảnh:</span>
            <span className="ml-2">
              {(compressionStats.original / 1024 / 1024).toFixed(2)} MB → {(compressionStats.compressed / 1024 / 1024).toFixed(2)} MB
            </span>
            <span className="ml-2 text-green-600 font-semibold">
              (-{compressionStats.reduction}%)
            </span>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {hasValidFiles && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {pendingFiles.length} file(s) sẵn sàng upload
          </div>
          <button
            onClick={uploadFiles}
            disabled={isUploading || !hasValidFiles}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Đang upload...' : 'Upload Files'}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}
