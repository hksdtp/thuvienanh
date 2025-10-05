'use client'

import { useState } from 'react'
import { 
  CloudIcon, 
  FolderIcon, 
  PhotoIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export default function SynologyTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  // Test connection
  const testConnection = async () => {
    setLoading(prev => ({ ...prev, connection: true }))
    setConnectionStatus('testing')

    try {
      const response = await fetch('/api/synology/photos?action=test')
      const result = await response.json()

      setTestResults(prev => ({ ...prev, connection: result }))
      setConnectionStatus(result.success ? 'success' : 'error')
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        connection: { 
          success: false, 
          message: 'Lỗi kết nối',
          error: error instanceof Error ? error.message : 'Unknown error'
        } 
      }))
      setConnectionStatus('error')
    } finally {
      setLoading(prev => ({ ...prev, connection: false }))
    }
  }

  // Test browse folders
  const testBrowseFolders = async () => {
    setLoading(prev => ({ ...prev, folders: true }))

    try {
      const response = await fetch('/api/synology/photos?action=folders')
      const result = await response.json()

      setTestResults(prev => ({ ...prev, folders: result }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        folders: { 
          success: false, 
          message: 'Lỗi lấy danh sách thư mục',
          error: error instanceof Error ? error.message : 'Unknown error'
        } 
      }))
    } finally {
      setLoading(prev => ({ ...prev, folders: false }))
    }
  }

  // Test browse shared folders
  const testBrowseSharedFolders = async () => {
    setLoading(prev => ({ ...prev, sharedFolders: true }))

    try {
      const response = await fetch('/api/synology/photos?action=shared-folders')
      const result = await response.json()

      setTestResults(prev => ({ ...prev, sharedFolders: result }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        sharedFolders: { 
          success: false, 
          message: 'Lỗi lấy danh sách thư mục chia sẻ',
          error: error instanceof Error ? error.message : 'Unknown error'
        } 
      }))
    } finally {
      setLoading(prev => ({ ...prev, sharedFolders: false }))
    }
  }

  // Test browse albums
  const testBrowseAlbums = async () => {
    setLoading(prev => ({ ...prev, albums: true }))

    try {
      const response = await fetch('/api/synology/photos?action=albums')
      const result = await response.json()

      setTestResults(prev => ({ ...prev, albums: result }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        albums: { 
          success: false, 
          message: 'Lỗi lấy danh sách albums',
          error: error instanceof Error ? error.message : 'Unknown error'
        } 
      }))
    } finally {
      setLoading(prev => ({ ...prev, albums: false }))
    }
  }

  // Test upload files
  const testUploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Vui lòng chọn file để upload')
      return
    }

    setLoading(prev => ({ ...prev, upload: true }))
    setUploadProgress('Đang upload...')

    try {
      const formData = new FormData()
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/synology/photos', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      setTestResults(prev => ({ ...prev, upload: result }))

      if (result.success) {
        setUploadProgress(`✅ Upload thành công: ${result.data.summary.success}/${result.data.summary.total} files`)
      } else {
        setUploadProgress(`❌ Upload thất bại: ${result.error}`)
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        upload: {
          success: false,
          message: 'Lỗi upload',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
      setUploadProgress('❌ Lỗi upload')
    } finally {
      setLoading(prev => ({ ...prev, upload: false }))
    }
  }

  // Run all tests
  const runAllTests = async () => {
    await testConnection()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testBrowseFolders()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testBrowseSharedFolders()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testBrowseAlbums()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CloudIcon className="w-8 h-8 text-blue-600" />
            Synology Photos API Test
          </h1>
          <p className="mt-2 text-gray-600">
            Kiểm tra kết nối và tính năng Synology Photos API
          </p>
        </div>

        {/* Connection Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin kết nối</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Primary URL:</span>
              <span className="ml-2 text-gray-600">http://222.252.23.248:8888</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Alternative URL:</span>
              <span className="ml-2 text-gray-600">http://222.252.23.248:6868</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Username:</span>
              <span className="ml-2 text-gray-600">haininh</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">API Endpoint:</span>
              <span className="ml-2 text-gray-600">/photo/webapi/entry.cgi</span>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Các bài test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Test Connection */}
            <button
              onClick={testConnection}
              disabled={loading.connection}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading.connection ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <CloudIcon className="w-5 h-5" />
              )}
              Test Connection
            </button>

            {/* Test Folders */}
            <button
              onClick={testBrowseFolders}
              disabled={loading.folders}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading.folders ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <FolderIcon className="w-5 h-5" />
              )}
              Browse Folders
            </button>

            {/* Test Shared Folders */}
            <button
              onClick={testBrowseSharedFolders}
              disabled={loading.sharedFolders}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading.sharedFolders ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <FolderIcon className="w-5 h-5" />
              )}
              Browse Shared
            </button>

            {/* Test Albums */}
            <button
              onClick={testBrowseAlbums}
              disabled={loading.albums}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading.albums ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <PhotoIcon className="w-5 h-5" />
              )}
              Browse Albums
            </button>

            {/* Run All Tests */}
            <button
              onClick={runAllTests}
              disabled={Object.values(loading).some(v => v)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors md:col-span-2"
            >
              {Object.values(loading).some(v => v) ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircleIcon className="w-5 h-5" />
              )}
              Chạy tất cả tests
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn files để upload
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
              {selectedFiles && selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Đã chọn {selectedFiles.length} file(s)
                </p>
              )}
            </div>

            <button
              onClick={testUploadFiles}
              disabled={loading.upload || !selectedFiles || selectedFiles.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
            >
              {loading.upload ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <CloudIcon className="w-5 h-5" />
                  Upload to Synology Photos
                </>
              )}
            </button>

            {uploadProgress && (
              <div className={`p-3 rounded-lg ${uploadProgress.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="text-sm font-medium">{uploadProgress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                {result.success ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
              </div>

              <p className={`text-sm mb-3 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>

              {result.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-red-800 font-mono">{result.error}</p>
                </div>
              )}

              {result.data && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Xem chi tiết
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs overflow-auto max-h-96">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {Object.keys(testResults).length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CloudIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Chưa có kết quả test. Nhấn các nút bên trên để bắt đầu test.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

