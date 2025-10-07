'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDaysIcon, PlusIcon, MagnifyingGlassIcon, FolderIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import PageHeader from '@/components/PageHeader'
import CreateAlbumModal from '@/components/CreateAlbumModal'
import EditAlbumModal from '@/components/EditAlbumModal'
import { CreateAlbumForm, Album, ApiResponse } from '@/types/database'
import Image from 'next/image'

interface EventFolder {
  name: string
  path: string
  imageCount?: number
  coverImage?: string
}

export default function EventAlbumsPage() {
  const router = useRouter()
  
  // Archive folders (read-only from Synology)
  const [archiveFolders, setArchiveFolders] = useState<EventFolder[]>([])
  const [archiveLoading, setArchiveLoading] = useState(true)
  
  // New albums (from database)
  const [albums, setAlbums] = useState<Album[]>([])
  const [albumsLoading, setAlbumsLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)

  useEffect(() => {
    fetchArchiveFolders()
    fetchAlbums()
  }, [])

  const fetchArchiveFolders = async () => {
    setArchiveLoading(true)
    try {
      const response = await fetch('/api/synology/list-event-folders')
      const result: ApiResponse<EventFolder[]> = await response.json()
      if (result.success && result.data) {
        setArchiveFolders(result.data)
      }
    } catch (error) {
      console.error('Error fetching archive folders:', error)
    } finally {
      setArchiveLoading(false)
    }
  }

  const fetchAlbums = async () => {
    setAlbumsLoading(true)
    try {
      const response = await fetch('/api/albums/event')
      const result: ApiResponse<Album[]> = await response.json()
      if (result.success && result.data) {
        setAlbums(result.data)
      }
    } catch (error) {
      console.error('Error fetching albums:', error)
    } finally {
      setAlbumsLoading(false)
    }
  }

  const handleEditAlbum = (album: Album, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedAlbum(album)
    setEditModalOpen(true)
  }

  const handleUpdateAlbum = async (data: { name: string; description?: string; tags?: string[] }) => {
    if (!selectedAlbum) return

    try {
      const response = await fetch(`/api/albums/by-id/${selectedAlbum.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        await fetchAlbums()
        setEditModalOpen(false)
        setSelectedAlbum(null)
      } else {
        throw new Error(result.error || 'Failed to update album')
      }
    } catch (error) {
      console.error('Error updating album:', error)
      alert('Có lỗi xảy ra khi cập nhật album')
    }
  }

  const handleDeleteAlbum = async (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Bạn có chắc chắn muốn xóa album này? Tất cả ảnh trong album sẽ bị xóa khỏi Synology.')) {
      return
    }

    try {
      const response = await fetch(`/api/albums/by-id/${albumId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchAlbums()
      } else {
        throw new Error(result.error || 'Failed to delete album')
      }
    } catch (error) {
      console.error('Error deleting album:', error)
      alert('Có lỗi xảy ra khi xóa album')
    }
  }

  const filteredArchiveFolders = archiveFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAlbums = albums.filter(album =>
    album.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Albums Sự Kiện"
        subtitle="Thư viện ảnh sự kiện công ty"
        icon={<CalendarDaysIcon className="w-8 h-8 text-blue-600" />}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm album..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Tạo Album Mới
          </button>
        </div>

        {/* SECTION 1: Archive Folders (Read-only) */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FolderIcon className="w-6 h-6 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Thư Viện Lưu Trữ</h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
              Chỉ xem
            </span>
          </div>

          {archiveLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredArchiveFolders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Không tìm thấy folder nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredArchiveFolders.map((folder, index) => (
                <div
                  key={folder.path}
                  onClick={() => router.push(`/albums/event/archive?path=${encodeURIComponent(folder.path)}&name=${encodeURIComponent(folder.name)}`)}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-200"
                >
                  {/* Cover Image */}
                  <div className="aspect-video bg-gradient-to-br from-amber-100 to-amber-200 relative overflow-hidden">
                    {folder.coverImage ? (
                      <Image
                        src={folder.coverImage}
                        alt={folder.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        quality={75}
                        priority={index < 4}
                        loading={index < 4 ? undefined : 'lazy'}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PhotoIcon className="w-16 h-16 text-amber-400" />
                      </div>
                    )}
                    {/* Read-only badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
                      Lưu trữ
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {folder.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {folder.imageCount || 0} ảnh
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: New Albums (Editable) */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <PhotoIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Albums Mới</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Có thể chỉnh sửa
            </span>
          </div>

          {albumsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Chưa có album nào</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Tạo Album Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAlbums.map((album, index) => (
                <div
                  key={album.id}
                  onClick={() => router.push(`/albums/event/${album.id}`)}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-200 relative"
                >
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditAlbum(album, e)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteAlbum(album.id, e)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                      title="Xóa"
                    >
                      <TrashIcon className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  {/* Cover Image */}
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                    {album.cover_image_url ? (
                      <Image
                        src={album.cover_image_url}
                        alt={album.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        quality={75}
                        priority={index < 4}
                        loading={index < 4 ? undefined : 'lazy'}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PhotoIcon className="w-16 h-16 text-blue-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {album.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                      {album.description || 'Chưa có mô tả'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {album.image_count || 0} ảnh
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Album Modal */}
      {createModalOpen && (
        <CreateAlbumModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={async (data: CreateAlbumForm) => {
            try {
              const response = await fetch('/api/albums', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  ...data,
                  category: 'event'
                })
              })

              const result = await response.json()

              if (result.success && result.data) {
                setCreateModalOpen(false)
                fetchAlbums()
              } else {
                alert(`Lỗi: ${result.error}`)
              }
            } catch (error) {
              console.error('Error creating album:', error)
              alert('Có lỗi xảy ra khi tạo album')
            }
          }}
        />
      )}

      {/* Edit Album Modal */}
      {editModalOpen && selectedAlbum && (
        <EditAlbumModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedAlbum(null)
          }}
          album={selectedAlbum}
          onSubmit={handleUpdateAlbum}
        />
      )}
    </div>
  )
}

