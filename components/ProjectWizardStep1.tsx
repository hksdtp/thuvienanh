'use client'

import { motion } from 'framer-motion'
import { HomeModernIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline'

interface ProjectWizardStep1Props {
  selectedType: 'nha-dan' | 'du-an' | null
  onTypeSelect: (type: 'nha-dan' | 'du-an') => void
  onContinue: () => void
}

// Component for Step 1: Select project type
export default function ProjectWizardStep1({
  selectedType,
  onTypeSelect,
  onContinue
}: ProjectWizardStep1Props) {
  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[#343F48] tracking-tight mb-2 sm:mb-3">
          Đây là Công Trình?
        </h1>
        <p className="text-sm sm:text-base text-[#343F48]/70 tracking-tight px-4">
          Chọn loại công trình bạn muốn tải lên
        </p>
      </motion.div>

      {/* Type Selection Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
      >
        {/* Nhà Dân Card */}
        <motion.button
          type="button"
          onClick={() => onTypeSelect('nha-dan')}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative p-6 sm:p-8 rounded-2xl border-3 transition-all duration-500 text-left
            ${selectedType === 'nha-dan'
              ? 'border-[#343F48] bg-[#343F48]/5 shadow-xl shadow-[#343F48]/20'
              : 'border-gray-300 bg-white hover:border-[#343F48]/50 hover:shadow-lg'
            }
          `}
        >
          {/* Icon */}
          <motion.div
            className={`
              w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-500
              ${selectedType === 'nha-dan'
                ? 'bg-[#343F48] text-white shadow-lg'
                : 'bg-gray-100 text-gray-600'
              }
            `}
            animate={{
              rotate: selectedType === 'nha-dan' ? [0, -10, 10, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut"
            }}
          >
            <HomeModernIcon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
          </motion.div>

          {/* Title */}
          <h3 className={`
            text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 tracking-tight transition-colors duration-500
            ${selectedType === 'nha-dan' ? 'text-[#343F48]' : 'text-[#343F48]'}
          `}>
            Nhà Dân
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#343F48]/70 tracking-tight">
            Công trình nhà ở cá nhân, biệt thự, căn hộ
          </p>

          {/* Selected Indicator */}
          {selectedType === 'nha-dan' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-[#343F48] rounded-full flex items-center justify-center shadow-lg"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>

        {/* Dự Án Card */}
        <motion.button
          type="button"
          onClick={() => onTypeSelect('du-an')}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative p-6 sm:p-8 rounded-2xl border-3 transition-all duration-500 text-left
            ${selectedType === 'du-an'
              ? 'border-[#343F48] bg-[#343F48]/5 shadow-xl shadow-[#343F48]/20'
              : 'border-gray-300 bg-white hover:border-[#343F48]/50 hover:shadow-lg'
            }
          `}
        >
          {/* Icon */}
          <motion.div
            className={`
              w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-500
              ${selectedType === 'du-an'
                ? 'bg-[#343F48] text-white shadow-lg'
                : 'bg-gray-100 text-gray-600'
              }
            `}
            animate={{
              rotate: selectedType === 'du-an' ? [0, -10, 10, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut"
            }}
          >
            <BuildingOffice2Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
          </motion.div>

          {/* Title */}
          <h3 className={`
            text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 tracking-tight transition-colors duration-500
            ${selectedType === 'du-an' ? 'text-[#343F48]' : 'text-[#343F48]'}
          `}>
            Dự Án
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#343F48]/70 tracking-tight">
            Dự án thương mại, văn phòng, khách sạn, nhà hàng
          </p>

          {/* Selected Indicator */}
          {selectedType === 'du-an' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-[#343F48] rounded-full flex items-center justify-center shadow-lg"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center"
      >
        <motion.button
          type="button"
          onClick={onContinue}
          disabled={!selectedType}
          whileHover={selectedType ? { scale: 1.05, y: -2 } : {}}
          whileTap={selectedType ? { scale: 0.95 } : {}}
          className={`
            px-8 sm:px-10 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold tracking-tight transition-all duration-500
            ${selectedType
              ? 'bg-[#343F48] text-white hover:bg-[#343F48]/90 shadow-lg hover:shadow-2xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <span className="flex items-center gap-2">
            Tiếp tục
            {selectedType && (
              <motion.svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={{ x: 0 }}
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            )}
          </span>
        </motion.button>
      </motion.div>
    </div>
  )
}

