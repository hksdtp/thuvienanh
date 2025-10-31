'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import ProjectImageUpload from './ProjectImageUpload'

interface ProjectWizardStep2Props {
  projectType: 'nha-dan' | 'du-an'
  onBack: () => void
  onSubmit: (data: ProjectFormData) => Promise<void>
}

export interface ProjectFormData {
  name: string
  location: string
  images: File[]
}

// Component for Step 2: Enter project information and upload images
export default function ProjectWizardStep2({
  projectType,
  onBack,
  onSubmit
}: ProjectWizardStep2Props) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    location: '',
    images: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get labels based on project type
  const nameLabel = projectType === 'nha-dan' ? 'Đây là nhà ai?' : 'Đây là Dự Án nào?'
  const namePlaceholder = projectType === 'nha-dan' 
    ? 'Ví dụ: Nhà anh Minh, Nhà chị Hoa...' 
    : 'Ví dụ: Khách sạn ABC, Văn phòng XYZ...'
  const typeLabel = projectType === 'nha-dan' ? 'Nhà Dân' : 'Dự Án'

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = `Vui lòng nhập ${nameLabel.toLowerCase()}`
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Vui lòng nhập địa chỉ'
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
      await onSubmit(formData)
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ submit: 'Có lỗi xảy ra. Vui lòng thử lại.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle images change - wrapped in useCallback to prevent infinite loop
  const handleImagesChange = useCallback((images: File[]) => {
    setFormData(prev => ({ ...prev, images }))
    // Clear image error if exists
    setErrors(prev => {
      if (prev.images) {
        const newErrors = { ...prev }
        delete newErrors.images
        return newErrors
      }
      return prev
    })
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 text-sm text-[#343F48]/70 hover:text-[#343F48] transition-all duration-300 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Quay lại</span>
        </motion.button>

        <div className="text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#343F48]/5 rounded-full mb-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="text-xs sm:text-sm font-medium text-[#343F48]">{typeLabel}</span>
          </motion.div>
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-[#343F48] tracking-tight mb-2 sm:mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Thông Tin Công Trình
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base text-[#343F48]/70 tracking-tight px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Điền thông tin và tải lên hình ảnh công trình
          </motion.p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6"
      >
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-[#343F48] tracking-tight">
            {nameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }))
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
            }}
            placeholder={namePlaceholder}
            className={`
              w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#343F48] placeholder:text-[#343F48]/40 tracking-tight
              focus:outline-none focus:ring-2 focus:ring-[#343F48] focus:border-transparent transition-all duration-200
              ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            `}
          />
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600"
            >
              {errors.name}
            </motion.p>
          )}
        </div>

        {/* Location Field */}
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium text-[#343F48] tracking-tight">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, location: e.target.value }))
              if (errors.location) setErrors(prev => ({ ...prev, location: '' }))
            }}
            placeholder="Ví dụ: 123 Đường ABC, Quận 1, TP.HCM"
            className={`
              w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#343F48] placeholder:text-[#343F48]/40 tracking-tight
              focus:outline-none focus:ring-2 focus:ring-[#343F48] focus:border-transparent transition-all duration-200
              ${errors.location ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            `}
          />
          {errors.location && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600"
            >
              {errors.location}
            </motion.p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <ProjectImageUpload
            projectType={projectType}
            onImagesChange={handleImagesChange}
            maxImages={20}
            maxSizeMB={20}
          />
          {errors.images && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600"
            >
              {errors.images}
            </motion.p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{errors.submit}</p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-white border border-gray-300 text-sm font-medium text-[#0a0a0a] tracking-tight hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quay lại
          </button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#343F48] text-sm font-medium text-white tracking-tight hover:bg-[#343F48]/90 focus:outline-none focus:ring-2 focus:ring-[#343F48] focus:ring-offset-2 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Đang tải lên...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Tải lên</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  )
}

