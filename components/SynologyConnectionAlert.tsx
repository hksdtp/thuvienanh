'use client'

import { useState, useEffect } from 'react'
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface ConnectionStatus {
  isConnected: boolean
  workingUrl?: string
  testedUrls: string[]
  errors?: string[]
  lastChecked?: string
}

export default function SynologyConnectionAlert() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  const checkConnection = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug/synology')
      const result = await response.json()
      
      if (result.success && result.data) {
        setStatus({
          isConnected: result.data.server.reachable,
          workingUrl: result.data.server.workingUrl,
          testedUrls: result.data.server.testedUrls || [],
          errors: result.data.server.errors,
          lastChecked: new Date().toLocaleTimeString('vi-VN')
        })
      } else {
        setStatus({
          isConnected: false,
          testedUrls: ['http://222.252.23.248:6868', 'http://222.252.23.248:8888'],
          errors: [result.error || 'Connection test failed'],
          lastChecked: new Date().toLocaleTimeString('vi-VN')
        })
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        testedUrls: ['http://222.252.23.248:6868', 'http://222.252.23.248:8888'],
        errors: ['Network error during connection test'],
        lastChecked: new Date().toLocaleTimeString('vi-VN')
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mr-3"></div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Đang kiểm tra kết nối Synology...
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              Testing ports 6868 và 8888
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!status) return null

  if (status.isConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Synology Photos đã kết nối
            </h3>
            <p className="text-sm text-green-600 mt-1">
              Kết nối thành công qua: <code className="bg-green-100 px-1 rounded">{status.workingUrl}</code>
            </p>
            <p className="text-xs text-green-500 mt-1">
              Kiểm tra lần cuối: {status.lastChecked}
            </p>
          </div>
          <button
            onClick={checkConnection}
            className="text-xs text-green-700 hover:text-green-900 underline ml-2"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Không thể kết nối Synology Photos
          </h3>
          <p className="text-sm text-red-600 mt-1">
            Upload sẽ tự động chuyển sang Local Storage
          </p>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-red-700 hover:text-red-900 underline mt-2"
          >
            {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
          </button>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-red-100 rounded border">
              <p className="text-xs font-medium text-red-800 mb-2">Đã test các URL:</p>
              <ul className="text-xs text-red-700 space-y-1">
                {status.testedUrls.map((url, index) => (
                  <li key={index} className="font-mono">❌ {url}</li>
                ))}
              </ul>
              
              {status.errors && status.errors.length > 0 && (
                <>
                  <p className="text-xs font-medium text-red-800 mt-3 mb-2">Lỗi:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {status.errors.map((error, index) => (
                      <li key={index} className="break-all">• {error}</li>
                    ))}
                  </ul>
                </>
              )}
              
              <div className="mt-3 pt-2 border-t border-red-200">
                <p className="text-xs text-red-600">
                  <strong>Khắc phục:</strong>
                </p>
                <ul className="text-xs text-red-600 mt-1 space-y-1">
                  <li>• Kiểm tra Synology NAS có đang chạy</li>
                  <li>• Kiểm tra kết nối mạng</li>
                  <li>• Xác nhận ports 6868 hoặc 8888 đang mở</li>
                  <li>• Kiểm tra firewall settings</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-red-500">
              Kiểm tra lần cuối: {status.lastChecked}
            </p>
            <button
              onClick={checkConnection}
              className="text-xs text-red-700 hover:text-red-900 underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
