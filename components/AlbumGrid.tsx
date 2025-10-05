'use client'

import { useState, useEffect } from 'react'
import AlbumCard from './AlbumCard'
import CreateAlbumModal from './CreateAlbumModal'
import { Album, CreateAlbumForm } from '@/types/database'
import { PhotoIcon, PlusIcon } from '@heroicons/react/24/outline'

interface AlbumGridProps {
  albums: Album[]
  loading?: boolean
  onAlbumCreate?: (data: CreateAlbumForm) => Promise<void>
  onAlbumEdit?: (album: Album, data: CreateAlbumForm) => Promise<void>
  onAlbumDelete?: (albumId: string) => Promise<void>
  onAlbumView?: (album: Album) => void
  className?: string
  columns?: number
}

export default function AlbumGrid({
  albums,
  loading = false,
  onAlbumCreate,
  onAlbumEdit,
  onAlbumDelete,
  onAlbumView,
  className = '',
  columns = 3
}: AlbumGridProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)

  // Handle create album
  const handleCreateAlbum = async (data: CreateAlbumForm) => {
    if (onAlbumCreate) {
      await onAlbumCreate(data)
    }
  }

  // Handle edit album
  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album)
    setCreateModalOpen(true)
  }

  // Handle update album
  const handleUpdateAlbum = async (data: CreateAlbumForm) => {
    if (editingAlbum && onAlbumEdit) {
      await onAlbumEdit(editingAlbum, data)
    }
  }

  // Handle delete album
  const handleDeleteAlbum = async (albumId: string) => {
    if (onAlbumDelete) {
      await onAlbumDelete(albumId)
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setCreateModalOpen(false)
    setEditingAlbum(null)
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải albums...</span>
        </div>
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <PhotoIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có album nào</h3>
          <p className="text-gray-500 mb-6">Tạo album đầu tiên để tổ chức ảnh vải của bạn</p>

          {onAlbumCreate && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Tạo Album Đầu Tiên
            </button>
          )}
        </div>

        {/* Create/Edit Album Modal - Must be included in empty state too! */}
        <CreateAlbumModal
          isOpen={createModalOpen}
          onClose={handleModalClose}
          onSubmit={editingAlbum ? handleUpdateAlbum : handleCreateAlbum}
          editingAlbum={editingAlbum}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Albums Grid */}
      <div 
        className="grid gap-6"
        style={{ 
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` 
        }}
      >
        {/* Create new album card */}
        {onAlbumCreate && (
          <div
            onClick={() => setCreateModalOpen(true)}
            className="group relative bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
          >
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <PlusIcon className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                  Tạo Album Mới
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Album cards */}
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onEdit={onAlbumEdit ? handleEditAlbum : undefined}
            onDelete={onAlbumDelete ? handleDeleteAlbum : undefined}
            onView={onAlbumView}
          />
        ))}
      </div>

      {/* Create/Edit Album Modal */}
      <CreateAlbumModal
        isOpen={createModalOpen}
        onClose={handleModalClose}
        onSubmit={editingAlbum ? handleUpdateAlbum : handleCreateAlbum}
        editingAlbum={editingAlbum}
      />
    </div>
  )
}
