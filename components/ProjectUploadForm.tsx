'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HomeModernIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline'
import ProjectImageUpload from './ProjectImageUpload'

interface ProjectFormData {
  name: string
  description: string
  type: 'nha-dan' | 'du-an'
  images: File[]
}

interface ProjectUploadFormProps {
  initialProjectType?: 'nha-dan' | 'du-an'
  onSubmit?: (data: ProjectFormData) => Promise<void>
  onCancel?: () => void
}

export default function ProjectUploadForm({
  initialProjectType = 'nha-dan',
  onSubmit,
  onCancel
}: ProjectUploadFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    type: initialProjectType,
    images: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên công trình'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả'
    }

    if (formData.images.length === 0) {
      newErrors.images = 'Vui lòng tải lên ít nhất 1 hình ảnh'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit?.(formData)
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle images change
  const handleImagesChange = (images: File[]) => {
    setFormData(prev => ({ ...prev, images }))
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-[#314158] mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="tracking-tight">Tạo Công Trình Mới</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#0f172b] tracking-tight">
            Thêm Công Trình
          </h1>
          <p className="mt-2 text-base text-[#45556c] tracking-tight">
            Điền thông tin và tải lên hình ảnh công trình của bạn
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-[10px] shadow-sm border border-gray-200 p-6 space-y-6"
        >
          {/* Project Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#314158] tracking-tight">
              Loại công trình
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'nha-dan' }))}
                className={`
                  px-4 py-3 rounded-[8px] border-2 text-sm font-medium tracking-tight transition-all duration-200 flex items-center justify-center gap-2
                  ${formData.type === 'nha-dan'
                    ? 'border-[#343F48] bg-[#343F48]/5 text-[#343F48]'
                    : 'border-gray-300 bg-white text-[#314158] hover:border-gray-400'
                  }
                `}
              >
                <HomeModernIcon className="w-5 h-5" />
                <span>Nhà Dân</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'du-an' }))}
                className={`
                  px-4 py-3 rounded-[8px] border-2 text-sm font-medium tracking-tight transition-all duration-200 flex items-center justify-center gap-2
                  ${formData.type === 'du-an'
                    ? 'border-[#343F48] bg-[#343F48]/5 text-[#343F48]'
                    : 'border-gray-300 bg-white text-[#314158] hover:border-gray-400'
                  }
                `}
              >
                <BuildingOffice2Icon className="w-5 h-5" />
                <span>Dự Án</span>
              </button>
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-[#314158] tracking-tight">
              Tên công trình
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }))
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
              }}
              placeholder="Nhập tên công trình..."
              className={`
                w-full px-4 py-3 rounded-[8px] border bg-white text-sm text-[#0f172b] placeholder:text-[#717182] tracking-tight
                focus:outline-none focus:ring-2 focus:ring-[#343F48] focus:border-transparent transition-all duration-200
                ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              `}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-[#314158] tracking-tight">
              Mô tả
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }))
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }))
              }}
              placeholder="Mô tả chi tiết về công trình..."
              rows={4}
              className={`
                w-full px-4 py-3 rounded-[8px] border bg-white text-sm text-[#0f172b] placeholder:text-[#717182] tracking-tight resize-none
                focus:outline-none focus:ring-2 focus:ring-[#343F48] focus:border-transparent transition-all duration-200
                ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              `}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <ProjectImageUpload
              projectType={formData.type}
              onImagesChange={handleImagesChange}
              maxImages={20}
              maxSizeMB={10}
            />
            {errors.images && (
              <p className="mt-2 text-sm text-red-600">{errors.images}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-[8px] bg-white border border-gray-300 text-sm font-medium text-[#0a0a0a] tracking-tight hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-[8px] bg-[#343F48] text-sm font-medium text-white tracking-tight hover:bg-[#343F48]/90 focus:outline-none focus:ring-2 focus:ring-[#343F48] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang lưu...</span>
                </>
              ) : (
                'Lưu Công Trình'
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}

