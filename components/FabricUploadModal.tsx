'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import FileUpload, { UploadResult } from '@/components/FileUpload'
import ImageGallery, { GalleryImage } from '@/components/ImageGallery'
import AlbumSelector from '@/components/AlbumSelector'
import CreateAlbumModal from '@/components/CreateAlbumModal'
import { CreateAlbumForm, ApiResponse, Album } from '@/types/database'

interface FabricUploadModalProps {
  isOpen: boolean
  onClose: () => void
  fabricId?: string
  fabricName?: string
  category?: string
  onSuccess?: () => void
  onUploadComplete?: (images: GalleryImage[]) => void
}

export default function FabricUploadModal({
  isOpen,
  onClose,
  fabricId,
  fabricName,
  category,
  onSuccess,
  onUploadComplete
}: FabricUploadModalProps) {
  const [uploadedImages, setUploadedImages] = useState<GalleryImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | undefined>()
  const [createAlbumModalOpen, setCreateAlbumModalOpen] = useState(false)

  // Handle upload completion
  const handleUploadComplete = (result: UploadResult) => {
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
    setIsUploading(false)

    // Auto-add to selected album if specified
    if (selectedAlbumId && newImages.length > 0) {
      addImagesToAlbum(newImages, selectedAlbumId)
    }

    // Show success message
    if (result.success.length > 0) {
      console.log(`Upload thành công ${result.success.length} file(s)!`)
    }

    // Show errors if any
    if (result.errors.length > 0) {
      const errorMessages = result.errors.map(e => `${e.file}: ${e.error}`).join('\n')
      console.error(`Có lỗi xảy ra:\n${errorMessages}`)
    }

    // Notify parent component
    if (onUploadComplete) {
      onUploadComplete([...uploadedImages, ...newImages])
    }
  }

  // Add images to album
  const addImagesToAlbum = async (images: GalleryImage[], albumId: string) => {
    try {
      for (const image of images) {
        await fetch(`/api/albums/${albumId}/images`, {
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
      console.log(`Added ${images.length} images to album ${albumId}`)
    } catch (error) {
      console.error('Error adding images to album:', error)
      alert('Upload thành công nhưng có lỗi khi thêm vào album')
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

    try {
      const response = await fetch(`/api/upload/delete?path=${encodeURIComponent(image.url)}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setUploadedImages(prev => prev.filter(img => img.id !== imageId))
      } else {
        console.error(`Lỗi khi xóa ảnh: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // Handle save and close
  const handleSaveAndClose = () => {
    if (onUploadComplete && uploadedImages.length > 0) {
      onUploadComplete(uploadedImages)
    }
    handleClose()
  }

  // Handle close
  const handleClose = () => {
    setUploadedImages([])
    setIsUploading(false)
    onClose()
  }

  return (
    <>
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Upload Hình Ảnh Vải
                      </Dialog.Title>
                      {fabricName && (
                        <p className="text-sm text-gray-600">
                          Cho vải: {fabricName}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upload Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Chọn và Upload Files
                      </h4>
                      
                      {/* Album Selector */}
                      <AlbumSelector
                        selectedAlbumId={selectedAlbumId}
                        onAlbumSelect={setSelectedAlbumId}
                        onCreateAlbum={() => setCreateAlbumModalOpen(true)}
                        className="mb-4"
                        disabled={isUploading}
                      />

                      <FileUpload
                        category="fabrics"
                        maxFiles={10}
                        maxFileSize={10}
                        onUploadComplete={handleUploadComplete}
                        onUploadStart={handleUploadStart}
                        selectedAlbumId={selectedAlbumId}
                        disabled={isUploading}
                        className="mb-4"
                      />

                      {/* Upload Stats */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-xl font-bold text-blue-600">
                              {uploadedImages.length}
                            </div>
                            <div className="text-xs text-gray-500">Ảnh đã upload</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-green-600">
                              {Math.round(uploadedImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024 * 100) / 100}MB
                            </div>
                            <div className="text-xs text-gray-500">Tổng dung lượng</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Preview ({uploadedImages.length} ảnh)
                      </h4>
                      
                      <div className="border border-gray-200 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                        {uploadedImages.length > 0 ? (
                          <ImageGallery
                            images={uploadedImages}
                            onDelete={handleImageDelete}
                            allowDelete={true}
                            allowReorder={false}
                            columns={2}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <PhotoIcon className="w-12 h-12 mb-2" />
                            <p className="text-sm">Chưa có ảnh nào được upload</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    {uploadedImages.length > 0 && (
                      <span>
                        {uploadedImages.length} ảnh sẵn sàng để lưu
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      disabled={isUploading}
                    >
                      Hủy
                    </button>
                    
                    <button
                      onClick={handleSaveAndClose}
                      disabled={uploadedImages.length === 0 || isUploading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? 'Đang upload...' : `Lưu ${uploadedImages.length} ảnh`}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>

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
            body: JSON.stringify({
              ...data,
              category: 'fabric', // Always fabric category for FabricUploadModal
              subcategory: category // Pass subcategory from props (moq, new, clearance, etc.)
            })
          })

          const result = await response.json()

          if (result.success && result.data) {
            setSelectedAlbumId(result.data.id)
            setCreateAlbumModalOpen(false)
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
    </>
  )
}
