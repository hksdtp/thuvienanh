'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  EyeIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Fabric, calculateStockStatus } from '@/types/database'

interface FabricCardProps {
  fabric: Fabric
  showRemoveFromCollection?: boolean
  onRemoveFromCollection?: () => void
}

export default function FabricCard({
  fabric,
  showRemoveFromCollection = false,
  onRemoveFromCollection
}: FabricCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={`/fabrics/${fabric.id}`}
      className="group block bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Remove button */}
      {showRemoveFromCollection && onRemoveFromCollection && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onRemoveFromCollection()
          }}
          className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Xóa khỏi bộ sưu tập"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}

      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {fabric.primary_image_url && !imageError ? (
          <Image
            src={fabric.primary_image_url}
            alt={fabric.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <PhotoIcon className="h-16 w-16" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
          {fabric.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">
          {fabric.description || `${fabric.material}, ${fabric.color}`}
        </p>
      </div>
    </Link>
  )
}
