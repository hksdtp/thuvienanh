'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  PhotoIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Fabric } from '@/types/database'
import FabricDetailModal from './FabricDetailModal'

interface FabricCardProps {
  fabric: Fabric
  showRemoveFromCollection?: boolean
  onRemoveFromCollection?: () => void
  onUpdate?: () => void
  onDelete?: () => void
  priority?: boolean
}

export default function FabricCard({
  fabric,
  showRemoveFromCollection = false,
  onRemoveFromCollection,
  onUpdate,
  onDelete,
  priority = false
}: FabricCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowDetailModal(true)
  }

  return (
    <>
      <div className="group block relative">
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={handleCardClick}
          className="cursor-pointer"
        >
        {/* Remove button */}
        {showRemoveFromCollection && onRemoveFromCollection && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault()
              onRemoveFromCollection()
            }}
            className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Xóa khỏi bộ sưu tập"
          >
            <XMarkIcon className="h-4 w-4" />
          </motion.button>
        )}

        {/* Image */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow">
          {fabric.primary_image_url && !imageError ? (
            <>
              {/* Loading skeleton */}
              {!imageLoaded && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-gray-200"
                />
              )}

              <Image
                src={fabric.primary_image_url}
                alt={fabric.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                className={`
                  object-cover transition-all duration-500
                  ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
                  group-hover:scale-110
                `}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading={priority ? 'eager' : 'lazy'}
                priority={priority}
                quality={85}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <PhotoIcon className="h-12 lg:h-16 w-12 lg:w-16" />
            </div>
          )}

          {/* Hover overlay with view icon */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <EyeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-xs lg:text-sm font-medium text-gray-900 text-center group-hover:text-cyan-600 transition-colors line-clamp-2 px-1">
          {fabric.name}
        </h3>
      </motion.div>
      </div>

      {/* Detail Modal */}
      <FabricDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        fabricId={fabric.id}
        onDelete={() => {
          setShowDetailModal(false)
          onDelete?.()
        }}
        onUpdate={() => {
          onUpdate?.()
        }}
      />
    </>
  )
}
