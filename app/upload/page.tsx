'use client'

import { useState } from 'react'
import FileUpload, { UploadResult } from '@/components/FileUpload'
import ImageGallery, { GalleryImage } from '@/components/ImageGallery'
import AlbumSelector from '@/components/AlbumSelector'
import CreateAlbumModal from '@/components/CreateAlbumModal'
import { CreateAlbumForm, ApiResponse, Album } from '@/types/database'
import { PhotoIcon, CloudArrowUpIcon, CloudIcon, ServerIcon } from '@heroicons/react/24/outline'
import SynologyStatus from '@/components/SynologyStatus'
import SynologyConnectionAlert from '@/components/SynologyConnectionAlert'

export default function UploadPage() {
  const [uploadedImages, setUploadedImages] = useState<GalleryImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'fabrics' | 'collections' | 'temp' | 'albums'>('temp')
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | undefined>()
  const [selectedAlbumName, setSelectedAlbumName] = useState<string>('')
  const [synologyAlbumName, setSynologyAlbumName] = useState<string>('test-upload-2024')
  const [useSynology, setUseSynology] = useState(false)
  const [createAlbumModalOpen, setCreateAlbumModalOpen] = useState(false)

  // Handle upload completion
  const handleUploadComplete = async (result: UploadResult) => {
    console.log('Upload completed:', result)

    // Convert uploaded files to gallery images
    const newImages: GalleryImage[] = result.success.map(file => ({
      id: file.id,
      url: file.url,
      originalName: file.originalName,
      fileName: file.fileName,
      mimeType: file.mimeType,
      size: file.size,
      uploadedAt: file.uploadedAt,
      alt: file.originalName
    }))

    // Add to gallery
    setUploadedImages(prev => [...prev, ...newImages])

    // Auto-add to selected album if specified
    if (selectedAlbumId && newImages.length > 0) {
      try {
        for (const image of newImages) {
          await fetch(`/api/albums/${selectedAlbumId}/images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              imageId: image.id,
              imageUrl: image.url,
              imageName: image.originalName || image.alt || 'Untitled'
            })
          })
        }
        console.log(`Added ${newImages.length} images to album ${selectedAlbumId}`)
      } catch (error) {
        console.error('Error adding images to album:', error)
        alert('Upload thành công nhưng có lỗi khi thêm vào album')
      }
    }

    // Show success message
    if (result.success.length > 0) {
      const albumMessage = selectedAlbumId ? ' và đã thêm vào album' : ''
      alert(`Upload thành công ${result.success.length} file(s)${albumMessage}!`)
    }

    // Show errors if any
    if (result.errors.length > 0) {
      const errorMessages = result.errors.map(e => `${e.file}: ${e.error}`).join('\n')
      alert(`Có lỗi xảy ra:\n${errorMessages}`)
    }
  }

  // Handle upload start
  const handleUploadStart = () => {
    setIsUploading(true)
  }

  // Handle image delete
  const handleImageDelete = async (imageId: string) => {
    const image = uploadedImages.find(img => img.id === imageId)
    if (!image) return

    if (!confirm(`Bạn có chắc muốn xóa ảnh "${image.originalName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/upload/delete?path=${encodeURIComponent(image.url)}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setUploadedImages(prev => prev.filter(img => img.id !== imageId))
        alert('Xóa ảnh thành công!')
      } else {
        alert(`Lỗi khi xóa ảnh: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Lỗi khi xóa ảnh')
    }
  }

  // Handle image reorder
  const handleImageReorder = (reorderedImages: GalleryImage[]) => {
    setUploadedImages(reorderedImages)
  }

  // Clear all images
  const clearAllImages = () => {
    if (!confirm('Bạn có chắc muốn xóa tất cả ảnh?')) {
      return
    }
    setUploadedImages([])
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <CloudArrowUpIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Hình Ảnh</h1>
              <p className="text-gray-600">Tải lên và quản lý hình ảnh vải</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Synology Connection Status */}
        <div className="mb-6">
          <SynologyConnectionAlert />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>
              
              {/* Storage Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Lưu trữ
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUseSynology(false)}
                    className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      !useSynology
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isUploading}
                  >
                    <ServerIcon className="w-4 h-4 mr-2" />
                    Local
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseSynology(true)}
                    className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      useSynology
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isUploading}
                  >
                    <CloudIcon className="w-4 h-4 mr-2" />
                    Synology
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    {useSynology
                      ? 'Ảnh sẽ được lưu trên Synology Photos'
                      : 'Ảnh sẽ được lưu trên server local'
                    }
                  </p>
                  {useSynology && (
                    <SynologyStatus className="mt-1" />
                  )}
                </div>
              </div>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUploading}
                >
                  <option value="temp">Tạm thời</option>
                  <option value="fabrics">Vải</option>
                  <option value="collections">Bộ sưu tập</option>
                  <option value="albums">Albums</option>
                </select>
              </div>

              {/* Album Name Input for Synology */}
              {useSynology && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Album (Synology)
                  </label>
                  <input
                    type="text"
                    value={selectedAlbumName}
                    onChange={(e) => setSelectedAlbumName(e.target.value)}
                    placeholder="Nhập tên album..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    disabled={isUploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Album sẽ được tạo tự động nếu chưa tồn tại
                  </p>
                </div>
              )}

              {/* Album Selection */}
              <AlbumSelector
                selectedAlbumId={selectedAlbumId}
                onAlbumSelect={setSelectedAlbumId}
                onCreateAlbum={() => setCreateAlbumModalOpen(true)}
                className="mb-6"
                disabled={isUploading}
              />

              {/* File Upload Component */}
              <FileUpload
                category={selectedCategory}
                maxFiles={10}
                maxFileSize={10}
                onUploadComplete={handleUploadComplete}
                onUploadStart={handleUploadStart}
                selectedAlbumId={selectedAlbumId}
                albumName={synologyAlbumName}
                onAlbumNameChange={setSynologyAlbumName}
                useSynology={useSynology}
                disabled={isUploading}
              />

              {/* Upload Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadedImages.length}
                    </div>
                    <div className="text-sm text-gray-500">Ảnh đã upload</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(uploadedImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024 * 100) / 100}MB
                    </div>
                    <div className="text-sm text-gray-500">Tổng dung lượng</div>
                  </div>
                </div>
              </div>

              {/* Clear All Button */}
              {uploadedImages.length > 0 && (
                <button
                  onClick={clearAllImages}
                  className="w-full mt-4 px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  Xóa tất cả ảnh
                </button>
              )}
            </div>
          </div>

          {/* Gallery Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Gallery ({uploadedImages.length} ảnh)
                </h2>
                
                {uploadedImages.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <PhotoIcon className="w-4 h-4" />
                    <span>Click để xem chi tiết, kéo thả để sắp xếp</span>
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              <ImageGallery
                images={uploadedImages}
                onDelete={handleImageDelete}
                onReorder={handleImageReorder}
                allowDelete={true}
                allowReorder={true}
                columns={3}
                className="min-h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={createAlbumModalOpen}
        onClose={() => setCreateAlbumModalOpen(false)}
        onSubmit={async (data) => {
          try {
            const response = await fetch('/api/albums', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            })

            const result = await response.json()

            if (result.success && result.data) {
              setSelectedAlbumId(result.data.id)
              alert('Tạo album thành công!')
            } else {
              alert(`Lỗi: ${result.error}`)
            }
          } catch (error) {
            console.error('Error creating album:', error)
            alert('Có lỗi xảy ra khi tạo album')
          }
        }}
      />
    </div>
  )
}
