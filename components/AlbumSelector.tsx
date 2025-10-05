'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Album, ApiResponse } from '@/types/database'

interface AlbumSelectorProps {
  selectedAlbumId?: string
  onAlbumSelect: (albumId: string | undefined) => void
  onCreateAlbum?: () => void
  className?: string
  disabled?: boolean
}

export default function AlbumSelector({
  selectedAlbumId,
  onAlbumSelect,
  onCreateAlbum,
  className = '',
  disabled = false
}: AlbumSelectorProps) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  // Fetch albums
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch('/api/albums')
        const result: ApiResponse<Album[]> = await response.json()
        
        if (result.success && result.data) {
          // Parse dates properly
          const albumsWithDates = result.data.map(album => ({
            ...album,
            created_at: new Date(album.created_at),
            updated_at: new Date(album.updated_at)
          }))
          setAlbums(albumsWithDates)
        }
      } catch (error) {
        console.error('Error fetching albums:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [])

  // Get selected album
  const selectedAlbum = albums.find(album => album.id === selectedAlbumId)

  // Handle album selection
  const handleAlbumSelect = (albumId: string | undefined) => {
    onAlbumSelect(albumId)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Thêm vào Album (tùy chọn)
      </label>
      
      {/* Selector button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className="relative w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center">
          {selectedAlbum ? (
            <>
              <PhotoIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
              <span className="block truncate">{selectedAlbum.name}</span>
              <span className="ml-2 text-xs text-gray-500">
                ({selectedAlbum.image_count} ảnh)
              </span>
            </>
          ) : (
            <>
              <PhotoIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
              <span className="block truncate text-gray-500">
                {loading ? 'Đang tải...' : 'Chọn album'}
              </span>
            </>
          )}
        </span>
        <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {/* No album option */}
          <button
            type="button"
            onClick={() => handleAlbumSelect(undefined)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
              !selectedAlbumId ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
            }`}
          >
            <PhotoIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
            Không thêm vào album
          </button>

          {/* Create new album option */}
          {onCreateAlbum && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                onCreateAlbum()
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-blue-600 border-b border-gray-200"
            >
              <PlusIcon className="flex-shrink-0 h-5 w-5 mr-3" />
              Tạo album mới
            </button>
          )}

          {/* Album list */}
          {albums.length > 0 ? (
            albums.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => handleAlbumSelect(album.id)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                  selectedAlbumId === album.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <PhotoIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{album.name}</span>
                    {album.description && (
                      <span className="block truncate text-xs text-gray-500">
                        {album.description}
                      </span>
                    )}
                  </div>
                </div>
                <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                  {album.image_count} ảnh
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500 text-center">
              Chưa có album nào
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
