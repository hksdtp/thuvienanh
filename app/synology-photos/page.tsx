'use client'

import { useState, useEffect } from 'react'
import { PhotoIcon, FolderIcon } from '@heroicons/react/24/outline'
import PageHeader from '@/components/PageHeader'
import Image from 'next/image'

interface SynologyAlbum {
  id: number
  name: string
  item_count: number
  shared: boolean
  create_time: number
  start_time: number
  end_time: number
  passphrase: string
}

interface SynologyPhoto {
  id: number
  filename: string
  filesize: number
  time: number
  indexed_time: number
  owner_user_id: number
  folder_id: number
  type: string
  additional: {
    resolution: {
      width: number
      height: number
    }
    thumbnail: {
      sm: string
      xl: string
      cache_key: string
    }
  }
  thumbnailUrl: string
  imageUrl: string
}

export default function SynologyPhotosPage() {
  const [albums, setAlbums] = useState<SynologyAlbum[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<SynologyAlbum | null>(null)
  const [photos, setPhotos] = useState<SynologyPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<SynologyPhoto | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    checkConnection()
    fetchAlbums()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/synology/photos?action=test')
      const result = await response.json()
      setConnectionStatus(result.success ? 'connected' : 'error')
    } catch (error) {
      setConnectionStatus('error')
    }
  }

  const fetchAlbums = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/synology/photos?action=albums')
      const result = await response.json()
      
      if (result.success && result.data?.albums) {
        setAlbums(result.data.albums)
      }
    } catch (error) {
      console.error('Error fetching albums:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPhotos = async (albumId: number) => {
    setLoadingPhotos(true)
    try {
      const response = await fetch(`/api/synology/list-album-photos?albumId=${albumId}&limit=100`)
      const result = await response.json()
      
      if (result.success && result.data?.photos) {
        setPhotos(result.data.photos)
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoadingPhotos(false)
    }
  }

  const handleAlbumClick = (album: SynologyAlbum) => {
    setSelectedAlbum(album)
    fetchPhotos(album.id)
  }

  const handleBackToAlbums = () => {
    setSelectedAlbum(null)
    setPhotos([])
  }

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title="Synology Photos"
        subtitle={selectedAlbum ? selectedAlbum.name : 'Thư viện ảnh từ Synology NAS'}
        icon={<PhotoIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          selectedAlbum && (
            <button
              onClick={handleBackToAlbums}
              className="px-4 py-2 text-sm font-medium text-ios-blue hover:bg-ios-gray-50 rounded-lg transition-colors"
            >
              ← Quay lại Albums
            </button>
          )
        }
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
            {connectionStatus === 'connected' && 'Đã kết nối Synology Photos'}
            {connectionStatus === 'error' && 'Lỗi kết nối Synology Photos'}
            {connectionStatus === 'checking' && 'Đang kiểm tra kết nối...'}
          </div>
        </div>

        {/* Albums Grid */}
        {!selectedAlbum && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
                <span className="ml-3 text-macos-text-secondary font-medium">Đang tải albums...</span>
              </div>
            ) : albums.length === 0 ? (
              <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
                <FolderIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
                  Chưa có album nào
                </h3>
                <p className="text-sm text-macos-text-secondary">
                  Tạo album trên Synology Photos để hiển thị ở đây
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {albums.map((album, index) => (
                  <div
                    key={album.id}
                    onClick={() => handleAlbumClick(album)}
                    className="animate-slideUp bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light cursor-pointer group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-ios-gray-50 flex items-center justify-center">
                      <FolderIcon className="w-16 h-16 text-ios-gray-300 group-hover:text-ios-blue transition-colors" strokeWidth={1.5} />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-macos-text-primary mb-1 group-hover:text-ios-blue transition-colors">
                        {album.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-macos-text-secondary">
                        <span>{album.item_count} ảnh</span>
                        {album.shared && (
                          <span className="px-2 py-1 bg-ios-blue bg-opacity-10 text-ios-blue rounded">
                            Chia sẻ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Photos Grid */}
        {selectedAlbum && (
          <>
            {loadingPhotos ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
                <span className="ml-3 text-macos-text-secondary font-medium">Đang tải ảnh...</span>
              </div>
            ) : photos.length === 0 ? (
              <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
                <PhotoIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
                  Album trống
                </h3>
                <p className="text-sm text-macos-text-secondary">
                  Chưa có ảnh nào trong album này
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="animate-slideUp cursor-pointer group"
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-ios-gray-50 border border-macos-border-light hover:shadow-lg transition-all duration-200">
                      <img
                        src={photo.thumbnailUrl}
                        alt={photo.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="mt-2 text-xs text-macos-text-secondary truncate">
                      {photo.filename}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Lightbox */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative max-w-7xl max-h-full">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.filename}
                className="max-w-full max-h-[90vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                <p className="font-medium">{selectedPhoto.filename}</p>
                <p className="text-sm text-gray-300">
                  {selectedPhoto.additional.resolution.width} × {selectedPhoto.additional.resolution.height} px
                  {' • '}
                  {(selectedPhoto.filesize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

