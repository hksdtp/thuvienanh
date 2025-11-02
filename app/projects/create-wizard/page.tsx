'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectWizardStep1 from '@/components/ProjectWizardStep1'
import ProjectWizardStep2, { ProjectFormData } from '@/components/ProjectWizardStep2'
import { ApiResponse } from '@/types/database'

type WizardStep = 1 | 2
type ProjectType = 'nha-dan' | 'du-an' | null

// Main wizard page component
export default function ProjectCreateWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [selectedType, setSelectedType] = useState<ProjectType>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Handle type selection in Step 1
  const handleTypeSelect = (type: 'nha-dan' | 'du-an') => {
    setSelectedType(type)
  }

  // Handle continue from Step 1 to Step 2
  const handleContinueToStep2 = () => {
    if (selectedType) {
      setCurrentStep(2)
    }
  }

  // Handle back from Step 2 to Step 1
  const handleBackToStep1 = () => {
    setCurrentStep(1)
  }

  // Handle form submission in Step 2
  const handleSubmit = async (formData: ProjectFormData) => {
    if (!selectedType) return

    console.log('📤 Submitting project:', {
      type: selectedType,
      name: formData.name,
      location: formData.location,
      imagesCount: formData.images.length
    })

    try {
      // Create FormData for file upload
      const uploadFormData = new FormData()
      uploadFormData.append('name', formData.name)
      uploadFormData.append('description', formData.name) // Use name as description
      uploadFormData.append('location', formData.location)
      uploadFormData.append('type', selectedType)

      // Append all images
      formData.images.forEach((image) => {
        uploadFormData.append('images', image)
      })

      // Submit to API
      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const result: ApiResponse<any> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      console.log('✅ Upload success:', result)

      // Show success message
      setShowSuccess(true)

      // Redirect to project detail page after 1.5 seconds
      setTimeout(() => {
        if (result.data?.id) {
          router.push(`/projects/${result.data.id}`)
        } else {
          // Fallback to project list page
          const redirectPath = selectedType === 'du-an' 
            ? '/projects/du-an' 
            : '/projects/khach-hang-le'
          router.push(redirectPath)
        }
      }, 1500)

    } catch (error: any) {
      console.error('❌ Upload error:', error)
      throw error // Re-throw to let Step 2 component handle the error display
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Text */}
      <div className="max-w-3xl mx-auto mb-6 sm:mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] // Custom easing for smooth effect
          }}
        >
          <motion.h1
            className="text-xl sm:text-2xl font-bold text-[#343F48] tracking-tight mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Thư Viện Ảnh Công Trình
          </motion.h1>
          <motion.p
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#343F48] tracking-wider"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.4,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            INCANTO
          </motion.p>
        </motion.div>
      </div>

      {/* Progress Indicator */}
      <motion.div
        className="max-w-3xl mx-auto mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {/* Step 1 Indicator */}
          <div className="flex items-center">
            <motion.div
              className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-500
                ${currentStep === 1
                  ? 'bg-[#343F48] text-white shadow-lg shadow-[#343F48]/30'
                  : 'bg-white text-[#343F48] border-2 border-[#343F48]'
                }
              `}
              animate={{
                scale: currentStep === 1 ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
            >
              {currentStep > 1 ? (
                <motion.svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                '1'
              )}
            </motion.div>
            <span className={`
              ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium transition-all duration-300
              ${currentStep === 1 ? 'text-[#343F48]' : 'text-gray-600'}
            `}>
              Chọn loại
            </span>
          </div>

          {/* Connector Line */}
          <motion.div
            className="h-1 rounded-full bg-gray-300 relative overflow-hidden"
            style={{ width: '40px' }}
            initial={{ width: '40px' }}
            animate={{ width: currentStep === 2 ? '64px' : '40px' }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-[#343F48]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: currentStep === 2 ? 1 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ transformOrigin: 'left' }}
            />
          </motion.div>

          {/* Step 2 Indicator */}
          <div className="flex items-center">
            <motion.div
              className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-500
                ${currentStep === 2
                  ? 'bg-[#343F48] text-white shadow-lg shadow-[#343F48]/30'
                  : 'bg-gray-200 text-gray-400'
                }
              `}
              animate={{
                scale: currentStep === 2 ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
            >
              2
            </motion.div>
            <span className={`
              ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium transition-all duration-300
              ${currentStep === 2 ? 'text-[#343F48]' : 'text-gray-400'}
            `}>
              Thông tin
            </span>
          </div>
        </div>
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <ProjectWizardStep1
              selectedType={selectedType}
              onTypeSelect={handleTypeSelect}
              onContinue={handleContinueToStep2}
            />
          </motion.div>
        )}

        {currentStep === 2 && selectedType && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <ProjectWizardStep2
              projectType={selectedType}
              onBack={handleBackToStep1}
              onSubmit={handleSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{
                type: 'spring',
                duration: 0.6,
                bounce: 0.4
              }}
              className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl border border-gray-100"
            >
              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15
                }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
              >
                <motion.svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: "easeInOut" }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-[#343F48] mb-3">
                  Tải lên thành công!
                </h3>
                <p className="text-base sm:text-lg text-[#343F48]/70 mb-6">
                  Công trình của bạn đã được tạo thành công
                </p>
              </motion.div>

              {/* Loading Indicator */}
              <motion.div
                className="flex items-center justify-center gap-3 text-sm sm:text-base text-[#343F48] bg-[#343F48]/5 rounded-xl py-3 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <svg className="w-5 h-5 animate-spin text-[#343F48]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-medium">Đang chuyển hướng...</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

