'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface SMBStatusProps {
  className?: string
}

interface ConnectionStatus {
  connected: boolean
  error?: string
  lastChecked?: string
}

export default function SMBStatus({ className = '' }: SMBStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false })
  const [loading, setLoading] = useState(true)

  const checkConnection = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/upload/smb')
      const result = await response.json()
      
      setStatus({
        connected: result.success && result.data?.smb,
        error: result.data?.error || (!result.success ? 'Connection failed' : undefined),
        lastChecked: new Date().toLocaleTimeString('vi-VN')
      })
    } catch (error) {
      setStatus({
        connected: false,
        error: 'Network error',
        lastChecked: new Date().toLocaleTimeString('vi-VN')
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Checking SMB...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {status.connected ? (
        <>
          <CheckCircleIcon className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">SMB Connected</span>
        </>
      ) : (
        <>
          <XCircleIcon className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">SMB Offline</span>
        </>
      )}
      
      {status.error && (
        <div className="flex items-center space-x-1">
          <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-amber-600" title={status.error}>
            {status.error.length > 20 ? `${status.error.substring(0, 20)}...` : status.error}
          </span>
        </div>
      )}
      
      {status.lastChecked && (
        <span className="text-xs text-gray-400">
          {status.lastChecked}
        </span>
      )}
      
      <button
        onClick={checkConnection}
        className="text-xs text-blue-600 hover:text-blue-800 underline"
        disabled={loading}
      >
        Refresh
      </button>
    </div>
  )
}
