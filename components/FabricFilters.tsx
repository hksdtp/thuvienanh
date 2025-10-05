'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { 
  Collection, 
  FabricFilter, 
  FABRIC_MATERIALS, 
  FABRIC_PATTERNS, 
  FABRIC_FINISHES 
} from '@/types/database'

interface FabricFiltersProps {
  collections: Collection[]
  filters: FabricFilter
  onFiltersChange: (filters: FabricFilter) => void
  onClearFilters: () => void
}

export default function FabricFilters({ 
  collections, 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: FabricFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    collection: true,
    material: true,
    color: false,
    pattern: false,
    price: false,
    stock: false
  })

  // Common colors for fabric
  const commonColors = [
    'Trắng', 'Đen', 'Xám', 'Xanh navy', 'Xanh dương', 'Xanh lá',
    'Đỏ', 'Hồng', 'Vàng', 'Cam', 'Tím', 'Nâu', 'Kem', 'Be'
  ]

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCollectionChange = (collectionId: string) => {
    const newFilters = {
      ...filters,
      collection_id: filters.collection_id === collectionId ? undefined : collectionId
    }
    onFiltersChange(newFilters)
  }

  const handleMaterialChange = (material: string) => {
    const currentMaterials = filters.material || []
    const newMaterials = currentMaterials.includes(material)
      ? currentMaterials.filter(m => m !== material)
      : [...currentMaterials, material]
    
    const newFilters = {
      ...filters,
      material: newMaterials.length > 0 ? newMaterials : undefined
    }
    onFiltersChange(newFilters)
  }

  const handleColorChange = (color: string) => {
    const currentColors = filters.color || []
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color]
    
    const newFilters = {
      ...filters,
      color: newColors.length > 0 ? newColors : undefined
    }
    onFiltersChange(newFilters)
  }

  const handlePatternChange = (pattern: string) => {
    const currentPatterns = filters.pattern || []
    const newPatterns = currentPatterns.includes(pattern)
      ? currentPatterns.filter(p => p !== pattern)
      : [...currentPatterns, pattern]
    
    const newFilters = {
      ...filters,
      pattern: newPatterns.length > 0 ? newPatterns : undefined
    }
    onFiltersChange(newFilters)
  }

  const handlePriceRangeChange = (min?: number, max?: number) => {
    const newFilters = {
      ...filters,
      price_range: (min !== undefined || max !== undefined) ? {
        min: min || 0,
        max: max || Infinity
      } : undefined
    }
    onFiltersChange(newFilters)
  }

  const handleStockStatusChange = (status: string) => {
    const newFilters = {
      ...filters,
      stock_status: filters.stock_status === status ? undefined : status as any
    }
    onFiltersChange(newFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  )

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Bộ lọc</h3>
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Màu sắc Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Màu sắc
          </label>
          <select
            value={filters.color?.[0] || ''}
            onChange={(e) => {
              const value = e.target.value
              const newFilters = {
                ...filters,
                color: value ? [value] : undefined
              }
              onFiltersChange(newFilters)
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            {commonColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Chất liệu Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chất liệu
          </label>
          <select
            value={filters.material?.[0] || ''}
            onChange={(e) => {
              const value = e.target.value
              const newFilters = {
                ...filters,
                material: value ? [value] : undefined
              }
              onFiltersChange(newFilters)
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            {FABRIC_MATERIALS.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </div>

        {/* Họa tiết Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họa tiết
          </label>
          <select
            value={filters.pattern?.[0] || ''}
            onChange={(e) => {
              const value = e.target.value
              const newFilters = {
                ...filters,
                pattern: value ? [value] : undefined
              }
              onFiltersChange(newFilters)
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            {FABRIC_PATTERNS.map((pattern) => (
              <option key={pattern} value={pattern}>
                {pattern}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
