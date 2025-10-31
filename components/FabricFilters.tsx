'use client'

import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  Collection,
  FabricFilter,
  FABRIC_MATERIALS,
  FABRIC_PATTERNS
} from '@/types/database'
import { t } from '@/lib/translations'

interface FabricFiltersProps {
  collections: Collection[]
  filters: FabricFilter
  onFiltersChange: (filters: FabricFilter) => void
  onClearFilters: () => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export default function FabricFilters({
  collections,
  filters,
  onFiltersChange,
  onClearFilters,
  isMobile = false,
  isOpen = true,
  onClose
}: FabricFiltersProps) {
  // Common colors for fabric
  const commonColors = [
    'Trắng', 'Đen', 'Xám', 'Xanh navy', 'Xanh dương', 'Xanh lá',
    'Đỏ', 'Hồng', 'Vàng', 'Cam', 'Tím', 'Nâu', 'Kem', 'Be'
  ]

  // Price ranges
  const priceRanges = [
    { label: t('priceRanges.any'), value: '' },
    { label: t('priceRanges.under50k'), min: 0, max: 50000 },
    { label: t('priceRanges.from50to100k'), min: 50000, max: 100000 },
    { label: t('priceRanges.from100to200k'), min: 100000, max: 200000 },
    { label: t('priceRanges.over200k'), min: 200000, max: Infinity }
  ]

  const handleColorChange = (value: string) => {
    const newFilters = {
      ...filters,
      color: value ? [value] : undefined
    }
    onFiltersChange(newFilters)
  }

  const handleMaterialChange = (value: string) => {
    const newFilters = {
      ...filters,
      material: value ? [value] : undefined
    }
    onFiltersChange(newFilters)
  }

  const handlePatternChange = (value: string) => {
    const newFilters = {
      ...filters,
      pattern: value ? [value] : undefined
    }
    onFiltersChange(newFilters)
  }

  const handlePriceChange = (value: string) => {
    if (!value) {
      const newFilters = { ...filters }
      delete newFilters.price_range
      onFiltersChange(newFilters)
      return
    }

    const range = priceRanges.find(r => r.label === value)
    if (range && range.min !== undefined) {
      const newFilters = {
        ...filters,
        price_range: {
          min: range.min,
          max: range.max
        }
      }
      onFiltersChange(newFilters)
    }
  }

  const getCurrentPriceLabel = () => {
    if (!filters.price_range) return ''
    const range = priceRanges.find(
      r => r.min === filters.price_range?.min && r.max === filters.price_range?.max
    )
    return range?.label || ''
  }

  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== '' &&
    (Array.isArray(value) ? value.length > 0 : true)
  )

  // Desktop: Horizontal layout
  const desktopContent = (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Color Filter */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            {t('filters.color')}
          </label>
          <div className="relative">
            <select
              value={filters.color?.[0] || ''}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full appearance-none px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer transition-all hover:border-gray-400"
            >
              <option value="">{t('common.any')}</option>
              {commonColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Material Filter */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            {t('filters.material')}
          </label>
          <div className="relative">
            <select
              value={filters.material?.[0] || ''}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full appearance-none px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer transition-all hover:border-gray-400"
            >
              <option value="">{t('common.any')}</option>
              {FABRIC_MATERIALS.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pattern Filter */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            {t('filters.pattern')}
          </label>
          <div className="relative">
            <select
              value={filters.pattern?.[0] || ''}
              onChange={(e) => handlePatternChange(e.target.value)}
              className="w-full appearance-none px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer transition-all hover:border-gray-400"
            >
              <option value="">{t('common.any')}</option>
              {FABRIC_PATTERNS.map((pattern) => (
                <option key={pattern} value={pattern}>
                  {pattern}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Price Filter */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            {t('filters.price')}
          </label>
          <div className="relative">
            <select
              value={getCurrentPriceLabel()}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="w-full appearance-none px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer transition-all hover:border-gray-400"
            >
              {priceRanges.map((range) => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClearFilters}
            className="self-end px-4 py-2 text-sm font-medium text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-2"
            title={t('filters.clearFilters')}
          >
            <XMarkIcon className="w-4 h-4" />
            <span className="hidden lg:inline">{t('filters.clearFilters')}</span>
          </motion.button>
        )}
      </div>
    </div>
  )

  // Mobile: Vertical layout (bottom sheet)
  const mobileContent = (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{t('filters.title')}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Color Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('filters.color')}
          </label>
          <div className="relative">
            <select
              value={filters.color?.[0] || ''}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer transition-all"
            >
              <option value="">{t('common.any')}</option>
              {commonColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Material Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('filters.material')}
          </label>
          <div className="relative">
            <select
              value={filters.material?.[0] || ''}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer transition-all"
            >
              <option value="">{t('common.any')}</option>
              {FABRIC_MATERIALS.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Pattern Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('filters.pattern')}
          </label>
          <div className="relative">
            <select
              value={filters.pattern?.[0] || ''}
              onChange={(e) => handlePatternChange(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer transition-all"
            >
              <option value="">{t('common.any')}</option>
              {FABRIC_PATTERNS.map((pattern) => (
                <option key={pattern} value={pattern}>
                  {pattern}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Price Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('filters.price')}
          </label>
          <div className="relative">
            <select
              value={getCurrentPriceLabel()}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer transition-all"
            >
              {priceRanges.map((range) => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClearFilters}
            className="w-full px-4 py-2.5 text-sm font-medium text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-md transition-colors"
          >
            {t('filters.clearFilters')}
          </motion.button>
        )}
      </div>
    </div>
  )

  // Mobile: Bottom sheet
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
        )}

        {/* Bottom Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isOpen ? 0 : '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden"
        >
          {mobileContent}
        </motion.div>
      </>
    )
  }

  // Desktop: Horizontal layout
  return desktopContent
}
