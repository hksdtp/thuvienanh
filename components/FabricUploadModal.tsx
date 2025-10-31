'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import FabricCreateForm, { FabricFormData } from '@/components/FabricCreateForm'

interface FabricUploadModalProps {
  isOpen: boolean
  onClose: () => void
  fabricId?: string
  fabricName?: string
  category?: string
  onSuccess?: () => void
}

export default function FabricUploadModal({
  isOpen,
  onClose,
  category,
  onSuccess
}: FabricUploadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: FabricFormData) => {
    setIsSubmitting(true)
    try {
      console.log('📝 Submitting fabric data:', data)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('code', data.code)
      formData.append('description', data.description)
      formData.append('material', data.material)
      formData.append('width', data.width.toString())
      formData.append('weight', data.weight.toString())
      formData.append('color', data.color)
      formData.append('pattern', data.pattern)
      formData.append('finish', data.finish)
      formData.append('origin', data.origin)
      formData.append('price_per_meter', data.price_per_meter.toString())
      formData.append('stock_quantity', data.stock_quantity.toString())
      formData.append('min_order_quantity', data.min_order_quantity.toString())
      formData.append('tags', JSON.stringify(data.tags))
      formData.append('search_keywords', data.search_keywords)

      // Append all images
      data.images.forEach((image) => {
        formData.append('images', image)
      })

      // Submit to API
      const response = await fetch('/api/fabrics', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        alert(`✅ Đã tạo vải mới: ${result.data.name}`)
        onSuccess?.()
        onClose()
      } else {
        alert(`❌ Lỗi: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating fabric:', error)
      alert('❌ Lỗi khi tạo vải mới')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold text-gray-900"
                  >
                    Thêm vải mới {category && `- ${category}`}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <FabricCreateForm
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

