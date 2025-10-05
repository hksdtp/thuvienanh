'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  PhotoIcon, 
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Album } from '@/types/database'

interface AlbumCardProps {
  album: Album
  onEdit?: (album: Album) => void
  onDelete?: (albumId: string) => void
  onView?: (album: Album) => void
  className?: string
}

export default function AlbumCard({
  album,
  onEdit,
  onDelete,
  onView,
  className = ''
}: AlbumCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Format date
  const formatDate = (date: Date): string => {
    try {
      // Ensure date is valid
      const validDate = new Date(date)
      if (isNaN(validDate.getTime())) {
        return 'N/A'
      }

      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(validDate)
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'N/A'
    }
  }

  // Get category display name
  const getCategoryName = (category?: string): string => {
    const categoryNames: Record<string, string> = {
      fabric: 'Vải',
      collection: 'Bộ sưu tập',
      project: 'Dự án',
      season: 'Mùa',
      client: 'Khách hàng',
      other: 'Khác'
    }
    return categoryNames[category || 'other'] || 'Khác'
  }

  // Get category color
  const getCategoryColor = (category?: string): string => {
    const categoryColors: Record<string, string> = {
      fabric: 'bg-blue-100 text-blue-800',
      collection: 'bg-green-100 text-green-800',
      project: 'bg-purple-100 text-purple-800',
      season: 'bg-orange-100 text-orange-800',
      client: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return categoryColors[category || 'other'] || 'bg-gray-100 text-gray-800'
  }

  const handleCardClick = () => {
    if (onView) {
      onView(album)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    if (onEdit) {
      onEdit(album)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    if (onDelete && confirm(`Bạn có chắc muốn xóa album "${album.name}"?`)) {
      onDelete(album.id)
    }
  }

  return (
    <div className={`group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}>
      {/* Cover Image */}
      <div 
        className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative"
        onClick={handleCardClick}
      >
        {album.cover_image_url ? (
          <Image
            src={album.cover_image_url}
            alt={album.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PhotoIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Image count overlay */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          {album.image_count} ảnh
        </div>

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(album.category)}`}>
            {getCategoryName(album.category)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4" onClick={handleCardClick}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
            {album.name}
          </h3>
          
          {/* Menu button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            
            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={handleCardClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <EyeIcon className="w-4 h-4 mr-3" />
                    Xem chi tiết
                  </button>
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <PencilIcon className="w-4 h-4 mr-3" />
                      Chỉnh sửa
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4 mr-3" />
                      Xóa album
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {album.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {album.description}
          </p>
        )}

        {/* Tags */}
        {album.tags && album.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {album.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {album.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                +{album.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Tạo: {formatDate(album.created_at)}</span>
          <span>Cập nhật: {formatDate(album.updated_at)}</span>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
