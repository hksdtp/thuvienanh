'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeftIcon,
  PhotoIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { ApiResponse } from '@/types/database'
import PageHeader from '@/components/PageHeader'
import ImageLightbox from '@/components/ImageLightbox'

interface EventImage {
  name: string
  path: string
  url: string
  size?: number
  time?: number
}

function ArchiveContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderPath = searchParams.get('path')
  const folderName = searchParams.get('name')

  const [images, setImages] = useState<EventImage[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (folderPath) {
      fetchImages()
    }
  }, [folderPath])

  const fetchImages = async () => {
    if (!folderPath) return

    setLoading(true)
    try {
      const response = await fetch(`/api/synology/list-event-images?path=${encodeURIComponent(folderPath)}`)
      const result: ApiResponse<EventImage[]> = await response.json()
      
      if (result.success && result.data) {
        // Proxy image URLs through our API to avoid Mixed Content errors
        const imagesWithProxyUrls = result.data.map(img => ({
          ...img,
          url: `/api/proxy-image?url=${encodeURIComponent(img.url)}`
        }))
        setImages(imagesWithProxyUrls)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  // Convert EventImage to format expected by ImageLightbox
  const lightboxImages = images.map(img => ({
    id: img.path,
    image_url: img.url,
    caption: img.name
  }))

  if (!folderPath || !folderName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy folder</p>
          <button
            onClick={() => router.push('/albums/event')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={folderName}
        subtitle="Thư viện marketing - Chỉ xem"
        icon={<FolderIcon className="w-8 h-8 text-amber-600" />}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/albums/event')}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Quay lại Albums Sự Kiện
        </button>

        {/* Info banner - Hidden by default, can be shown if needed */}

        {/* Images Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">Không có ảnh nào</p>
            <p className="text-gray-500 text-sm">Folder này chưa có ảnh</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Tìm thấy <span className="font-semibold text-gray-900">{images.length}</span> ảnh
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.path}
                  onClick={() => {
                    setCurrentImageIndex(index)
                    setLightboxOpen(true)
                  }}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    quality={75}
                    priority={index < 10}
                    loading={index < 10 ? undefined : 'lazy'}
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <PhotoIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Image Lightbox - WITHOUT delete button for archive */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        // No onDelete prop - read-only mode
      />
    </div>
  )
}

export default function ArchivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <ArchiveContent />
    </Suspense>
  )
}

