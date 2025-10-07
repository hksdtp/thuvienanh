'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeftIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Album, AlbumImage, ApiResponse } from '@/types/database'
import PageHeader from '@/components/PageHeader'
import ImageUploadModal from '@/components/ImageUploadModal'
import ImageLightbox from '@/components/ImageLightbox'

interface PageProps {
  params: {
    category: string
    id: string
  }
}

export default function AlbumDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [album, setAlbum] = useState<Album | null>(null)
  const [images, setImages] = useState<AlbumImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchAlbumData()
  }, [params.id])

  const fetchAlbumData = async () => {
    setLoading(true)
    try {
      const albumResponse = await fetch(`/api/albums/by-id/${params.id}`)
      const albumResult: ApiResponse<Album> = await albumResponse.json()

      if (albumResult.success && albumResult.data) {
        setAlbum(albumResult.data)
      }

      const imagesResponse = await fetch(`/api/albums/by-id/${params.id}/images`)
      const imagesResult: ApiResponse<AlbumImage[]> = await imagesResponse.json()

      if (imagesResult.success && imagesResult.data) {
        setImages(imagesResult.data)
      }
    } catch (error) {
      console.error('Error fetching album data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = async () => {
    await fetchAlbumData()
    setUploadModalOpen(false)
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return

    try {
      const response = await fetch(`/api/albums/by-id/${params.id}/images/${imageId}`, {
        method: 'DELETE'
      })

      const result: ApiResponse<{ deleted: boolean }> = await response.json()

      if (result.success) {
        setImages(prev => prev.filter(img => img.id !== imageId))
      } else {
        alert(`Lỗi: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Có lỗi xảy ra khi xóa ảnh')
    }
  }

  const handleSetCoverImage = async (image: AlbumImage) => {
    try {
      const response = await fetch(`/api/albums/by-id/${params.id}/cover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: image.image_id,
          imageUrl: image.image_url
        })
      })

      const result: ApiResponse<{ updated: boolean }> = await response.json()

      if (result.success) {
        await fetchAlbumData()
        alert('Đã đặt làm ảnh bìa!')
      } else {
        alert(`Lỗi: ${result.error}`)
      }
    } catch (error) {
      console.error('Error setting cover image:', error)
      alert('Có lỗi xảy ra')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue border-t-transparent"></div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-macos-text-primary mb-2">Không tìm thấy album</h2>
          <button
            onClick={() => router.back()}
            className="text-ios-blue hover:text-ios-blue-dark font-medium"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title={album.name}
        subtitle={`${images.length} ảnh`}
        icon={<PhotoIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-macos-text-primary text-sm font-medium rounded-lg hover:bg-ios-gray-50 transition-all border border-macos-border-light"
            >
              <ArrowLeftIcon className="w-5 h-5" strokeWidth={2} />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md"
            >
              <CloudArrowUpIcon className="w-5 h-5" strokeWidth={2} />
              <span>Upload ảnh</span>
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {album.description && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-macos-border-light">
            <p className="text-sm text-macos-text-secondary">{album.description}</p>
          </div>
        )}

        {images.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-macos-border-light">
            <PhotoIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-macos-text-primary mb-2">
              Chưa có ảnh nào
            </h3>
            <p className="text-sm text-macos-text-secondary mb-6">
              Upload ảnh đầu tiên vào album này
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all"
            >
              <CloudArrowUpIcon className="w-5 h-5" strokeWidth={2} />
              <span>Upload ảnh</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-square bg-white rounded-xl overflow-hidden border border-macos-border-light hover:shadow-lg transition-all duration-200 cursor-pointer"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => {
                  setCurrentImageIndex(index)
                  setLightboxOpen(true)
                }}
              >
                <Image
                  src={image.image_url}
                  alt={image.caption || 'Image'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetCoverImage(image)
                      }}
                      className="p-2 bg-white rounded-lg hover:bg-ios-gray-100 transition-colors"
                      title="Đặt làm ảnh bìa"
                    >
                      <PhotoIcon className="w-5 h-5 text-macos-text-primary" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteImage(image.id)
                      }}
                      className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa ảnh"
                    >
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>

                {album.cover_image_id === image.image_id && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-ios-blue text-white text-xs font-medium rounded">
                    Ảnh bìa
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {uploadModalOpen && (
        <ImageUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          entityType="album"
          entityId={params.id}
          category={params.category}
          maxFiles={20}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={images}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onDelete={async (imageId) => {
          await handleDeleteImage(imageId)
          setLightboxOpen(false)
        }}
      />
    </div>
  )
}
