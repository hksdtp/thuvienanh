'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Fabric, FabricImage, ApiResponse } from '@/types/database'
import ImageLightbox from '@/components/ImageLightbox'

interface FabricDetailPageProps {
  params: {
    id: string
  }
}

export default function FabricDetailPage({ params }: FabricDetailPageProps) {
  const router = useRouter()
  const [fabric, setFabric] = useState<Fabric | null>(null)
  const [images, setImages] = useState<FabricImage[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchFabric = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/fabrics/${params.id}`)
        const result: ApiResponse<Fabric> = await response.json()

        if (result.success && result.data) {
          setFabric(result.data)
          // Set images from fabric data
          if (result.data.images && result.data.images.length > 0) {
            setImages(result.data.images)
          }
        } else {
          console.error('Failed to fetch fabric:', result.error)
        }
      } catch (error) {
        console.error('Error fetching fabric:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFabric()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!fabric) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Không tìm thấy vải</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{fabric.name}</h1>
                <p className="text-sm text-gray-500">Mã: {fabric.code}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span>Thư Viện Ảnh</span>
            <span className="text-sm font-normal text-gray-500">
              {images.length} ảnh
            </span>
          </h3>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((image, idx) => (
                <div
                  key={image.id}
                  className="group relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    setCurrentImageIndex(idx)
                    setLightboxOpen(true)
                  }}
                >
                  <Image
                    src={image.url}
                    alt={fabric.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover group-hover:scale-110 transition-all duration-500"
                    quality={85}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />

                  {/* Index badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded backdrop-blur-sm">
                    {idx + 1}
                  </div>

                  {/* Primary badge */}
                  {image.is_primary && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                      Ảnh chính
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Chưa có ảnh nào</p>
            </div>
          )}
        </div>
      </div>

      {/* ImageLightbox - Same as Projects/Albums */}
      <ImageLightbox
        images={images.map(img => ({
          id: img.id,
          image_url: img.url,
          caption: fabric.name
        }))}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}

