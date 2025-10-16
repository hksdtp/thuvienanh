'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import FileUpload, { UploadResult } from '@/components/FileUpload'
import ImageGallery, { GalleryImage } from '@/components/ImageGallery'
import { ApiResponse } from '@/types/database'

interface ProjectUploadModalProps {
  isOpen: boolean
  onClose: () => void
  projectId?: string
  projectName?: string
  projectType?: string
  onSuccess?: () => void
  onUploadComplete?: (images: GalleryImage[]) => void
}

export default function ProjectUploadModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  projectType = 'general',
  onSuccess,
  onUploadComplete
}: ProjectUploadModalProps) {
  const [uploadedImages, setUploadedImages] = useState<GalleryImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  const handleUploadComplete = (result: UploadResult) => {
    console.log('Upload completed:', result)
    
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

    setUploadedImages(prev => [...prev, ...newImages])
    setIsUploading(false)

    if (result.success.length > 0) {
      console.log(`Upload thành công ${result.success.length} file(s)!`)
    }

    if (result.errors.length > 0) {
      const errorMessages = result.errors.map(e => `${e.file}: ${e.error}`).join('\n')
      console.error(`Có lỗi xảy ra:\n${errorMessages}`)
    }

    if (onUploadComplete) {
      onUploadComplete([...uploadedImages, ...newImages])
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      alert('Vui lòng nhập tên dự án')
      return
    }

    if (uploadedImages.length === 0) {
      alert('Vui lòng upload ít nhất 1 ảnh')
      return
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
          project_type: projectType === 'featured' ? 'commercial' : projectType,
          is_featured: projectType === 'featured',
          cover_image_url: uploadedImages[0].url,
          images: uploadedImages.map(img => ({
            image_url: img.url,
            image_id: img.id,
            caption: img.alt || img.originalName
          }))
        })
      })

      const result: ApiResponse<any> = await response.json()

      if (result.success) {
        console.log('Tạo dự án thành công!')
        if (onSuccess) {
          onSuccess()
        }
        handleClose()
      } else {
        alert(`Lỗi: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Có lỗi xảy ra khi tạo dự án')
    }
  }

  const handleClose = () => {
    setUploadedImages([])
    setNewProjectName('')
    setNewProjectDescription('')
    onClose()
  }

  return (
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {projectId ? `Upload ảnh cho ${projectName}` : 'Tạo dự án mới'}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {!projectId && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên dự án <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="Nhập tên dự án..."
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả
                        </label>
                        <textarea
                          value={newProjectDescription}
                          onChange={(e) => setNewProjectDescription(e.target.value)}
                          placeholder="Nhập mô tả dự án..."
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload ảnh dự án
                    </label>
                    <FileUpload
                      category="temp"
                      onUploadComplete={handleUploadComplete}
                      onUploadStart={() => setIsUploading(true)}
                      maxFiles={10}
                    />
                  </div>

                  {uploadedImages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Ảnh đã upload ({uploadedImages.length})
                      </h3>
                      <ImageGallery
                        images={uploadedImages}
                        onDelete={(imageId) => {
                          setUploadedImages(prev => prev.filter(img => img.id !== imageId))
                        }}
                        allowDelete={true}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Hủy
                  </button>
                  {!projectId && (
                    <button
                      onClick={handleCreateProject}
                      disabled={isUploading || uploadedImages.length === 0 || !newProjectName.trim()}
                      className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Tạo dự án
                    </button>
                  )}
                  {projectId && (
                    <button
                      onClick={() => {
                        if (onSuccess) onSuccess()
                        handleClose()
                      }}
                      disabled={isUploading}
                      className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Hoàn tất
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

