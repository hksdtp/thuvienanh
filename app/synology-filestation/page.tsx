'use client'

import { useState, useEffect } from 'react'
import { FolderIcon, DocumentIcon, ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import PageHeader from '@/components/PageHeader'

interface FileStationPath {
  path: string
  success: boolean
  files: number
  real_path?: string
  perm?: {
    acl: {
      read: boolean
      write: boolean
      exec: boolean
      del: boolean
      append: boolean
    }
    is_acl_mode: boolean
    posix: number
  }
  error?: {
    code: number
  }
}

interface FileItem {
  name: string
  path: string
  isdir: boolean
  additional?: {
    size?: number
    time?: {
      mtime: number
    }
  }
}

export default function SynologyFileStationPage() {
  const [paths, setPaths] = useState<FileStationPath[]>([])
  const [currentPath, setCurrentPath] = useState<string>('/Marketing/Ninh/thuvienanh')
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    checkPaths()
  }, [])

  useEffect(() => {
    if (currentPath) {
      listFiles(currentPath)
    }
  }, [currentPath])

  const checkPaths = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/synology/test-marketing-path')
      const result = await response.json()
      
      if (result.success && result.data?.results) {
        const validPaths = result.data.results.filter((p: FileStationPath) => p.success)
        setPaths(validPaths)
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('error')
      }
    } catch (error) {
      console.error('Error checking paths:', error)
      setConnectionStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const listFiles = async (path: string) => {
    setLoadingFiles(true)
    try {
      const response = await fetch(`/api/synology/list-photo-folder?folderPath=${encodeURIComponent(path)}`)
      const result = await response.json()
      
      if (result.success && result.data?.files) {
        setFiles(result.data.files)
      } else {
        setFiles([])
      }
    } catch (error) {
      console.error('Error listing files:', error)
      setFiles([])
    } finally {
      setLoadingFiles(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp * 1000).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title="Synology File Station"
        subtitle={`Quản lý files trên NAS - ${currentPath}`}
        icon={<FolderIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Connection Status */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-50 text-green-700' 
              : connectionStatus === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-ios-gray-50 text-macos-text-secondary'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' 
                ? 'bg-green-500' 
                : connectionStatus === 'error'
                ? 'bg-red-500'
                : 'bg-ios-gray-400 animate-pulse'
            }`} />
            {connectionStatus === 'connected' && 'Đã kết nối File Station'}
            {connectionStatus === 'error' && 'Lỗi kết nối File Station'}
            {connectionStatus === 'checking' && 'Đang kiểm tra kết nối...'}
          </div>
        </div>

        {/* Available Paths */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
            <span className="ml-3 text-macos-text-secondary font-medium">Đang kiểm tra paths...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-macos-text-primary mb-3">
                Thư mục có quyền truy cập:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {paths.map((pathInfo) => (
                  <button
                    key={pathInfo.path}
                    onClick={() => setCurrentPath(pathInfo.path)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      currentPath === pathInfo.path
                        ? 'bg-ios-blue bg-opacity-10 border-ios-blue'
                        : 'bg-white border-macos-border-light hover:border-ios-blue'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FolderIcon className={`w-5 h-5 flex-shrink-0 ${
                        currentPath === pathInfo.path ? 'text-ios-blue' : 'text-ios-gray-400'
                      }`} strokeWidth={1.8} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          currentPath === pathInfo.path ? 'text-ios-blue' : 'text-macos-text-primary'
                        }`}>
                          {pathInfo.path}
                        </p>
                        <p className="text-xs text-macos-text-secondary mt-1">
                          {pathInfo.files} items
                        </p>
                        {pathInfo.perm && (
                          <div className="flex gap-1 mt-2">
                            {pathInfo.perm.acl.read && (
                              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">R</span>
                            )}
                            {pathInfo.perm.acl.write && (
                              <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">W</span>
                            )}
                            {pathInfo.perm.acl.exec && (
                              <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">X</span>
                            )}
                          </div>
                        )}
                      </div>
                      {currentPath === pathInfo.path && (
                        <CheckCircleIcon className="w-5 h-5 text-ios-blue flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Files List */}
            <div className="bg-white rounded-xl border border-macos-border-light overflow-hidden">
              <div className="px-6 py-4 border-b border-macos-border-light">
                <h3 className="text-sm font-semibold text-macos-text-primary">
                  Nội dung thư mục
                </h3>
              </div>

              {loadingFiles ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-ios-blue border-t-transparent"></div>
                  <span className="ml-3 text-sm text-macos-text-secondary">Đang tải files...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="p-16 text-center">
                  <FolderIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
                    Thư mục trống
                  </h3>
                  <p className="text-sm text-macos-text-secondary">
                    Chưa có file nào trong thư mục này
                  </p>
                </div>
              ) : (
                <>
                  {/* Image Grid - Show images first */}
                  {files.filter(f => !f.isdir && /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)).length > 0 && (
                    <div className="p-6 border-b border-macos-border-light">
                      <h4 className="text-sm font-semibold text-macos-text-primary mb-4">
                        Hình ảnh ({files.filter(f => !f.isdir && /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)).length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {files
                          .filter(f => !f.isdir && /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name))
                          .map((file, index) => (
                            <div
                              key={`${file.path}-${index}`}
                              className="group cursor-pointer"
                            >
                              <div className="aspect-square relative rounded-lg overflow-hidden bg-ios-gray-50 border border-macos-border-light hover:shadow-lg transition-all duration-200">
                                <img
                                  src={`/api/synology/filestation-image?path=${encodeURIComponent(file.path)}`}
                                  alt={file.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                              </div>
                              <p className="mt-2 text-xs text-macos-text-secondary truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-macos-text-secondary">
                                {formatFileSize(file.additional?.size)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Files and Folders List */}
                  <div className="divide-y divide-macos-border-light">
                    {files.map((file, index) => (
                      <div
                        key={`${file.path}-${index}`}
                        className="px-6 py-4 hover:bg-ios-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {file.isdir ? (
                            <FolderIcon className="w-6 h-6 text-ios-blue flex-shrink-0" strokeWidth={1.8} />
                          ) : (
                            <DocumentIcon className="w-6 h-6 text-ios-gray-400 flex-shrink-0" strokeWidth={1.8} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-macos-text-primary truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-macos-text-secondary mt-0.5">
                              {file.isdir ? 'Thư mục' : formatFileSize(file.additional?.size)}
                              {file.additional?.time?.mtime && (
                                <> • {formatDate(file.additional.time.mtime)}</>
                              )}
                            </p>
                          </div>
                          {file.isdir && (
                            <button
                              onClick={() => setCurrentPath(file.path)}
                              className="px-3 py-1.5 text-xs font-medium text-ios-blue hover:bg-ios-blue hover:text-white rounded-lg transition-colors"
                            >
                              Mở
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                📋 Thông tin File Station
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Server: 222.252.23.248:8888</li>
                <li>• Share: marketing</li>
                <li>• User: haininh</li>
                <li>• Paths có quyền: {paths.length} thư mục</li>
                <li>• Thư mục hiện tại: {currentPath}</li>
                <li>• Files: {files.length} items</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

