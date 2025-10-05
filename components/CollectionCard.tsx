'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PhotoIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Collection } from '@/types/database'

interface CollectionCardProps {
  collection: Collection
  onDelete: (id: string) => void
}

export default function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }).format(new Date(date))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative">
        {collection.thumbnail_url && !imageError ? (
          <Image
            src={collection.thumbnail_url}
            alt={collection.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PhotoIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Overlay với số lượng vải */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {collection.fabric_count} vải
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {collection.name}
        </h3>
        
        {/* Description */}
        {collection.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {collection.description}
          </p>
        )}
        
        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            Tạo: {formatDate(collection.created_at)}
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <UserIcon className="h-4 w-4 mr-1" />
            Bởi: {collection.created_by}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Link
            href={`/collections/${collection.id}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Xem chi tiết
          </Link>
          
          <div className="flex items-center space-x-2">
            <Link
              href={`/collections/${collection.id}/edit`}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Chỉnh sửa"
            >
              <PencilIcon className="h-4 w-4" />
            </Link>
            
            <button
              onClick={() => onDelete(collection.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Xóa"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
