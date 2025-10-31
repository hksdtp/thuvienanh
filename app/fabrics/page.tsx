'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, PhotoIcon, PlusIcon, AdjustmentsHorizontalIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { Fabric, Collection, ApiResponse, FabricFilter } from '@/types/database'

import FabricCard from '@/components/FabricCard'
import FabricFilters from '@/components/FabricFilters'
import FabricUploadModal from '@/components/FabricUploadModal'
import { GalleryImage } from '@/components/ImageGallery'
import PageHeader from '@/components/PageHeader'
import { fabricsApi, collectionsApi } from '@/lib/api-client'
import { t } from '@/lib/translations'

export default function FabricsPage() {
  const searchParams = useSearchParams()
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FabricFilter>({})
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState(t('fabric.title'))
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle URL parameters for predefined filters
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam) {
      switch (filterParam) {
        case 'moq':
          setPageTitle('Vải Order theo MOQ')
          setFilters({ min_order_quantity: { min: 2, max: 999999 } }) // MOQ >= 2
          break
        case 'new':
          setPageTitle('Vải Mới')
          // Filter for fabrics created in last 30 days
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          setFilters({ created_after: thirtyDaysAgo.toISOString() })
          break
        case 'clearance':
          setPageTitle('Vải Thanh Lý')
          setFilters({ tags: ['thanh lý', 'clearance', 'sale'] })
          break
        default:
          setPageTitle('Thư Viện Vải')
          setFilters({})
      }
    } else {
      setPageTitle('Thư Viện Vải')
      setFilters({})
    }
  }, [searchParams])

  // Fetch fabrics và collections
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch fabrics using API client with filters
        const fabricsResponse = await fabricsApi.getAll(filters) as unknown as ApiResponse<Fabric[]>
        if (fabricsResponse.success && fabricsResponse.data) {
          setFabrics(fabricsResponse.data)
        }

        // Fetch collections for filter
        const collectionsResponse = await collectionsApi.getAll() as unknown as ApiResponse<Collection[]>
        if (collectionsResponse.success && collectionsResponse.data) {
          setCollections(collectionsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setFabrics([]) // Set empty array on error
        setCollections([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  // Apply filters
  const fetchFilteredFabrics = async (newFilters: FabricFilter) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      
      if (newFilters.search) params.append('search', newFilters.search)
      if (newFilters.material?.length) params.append('material', newFilters.material.join(','))
      if (newFilters.color?.length) params.append('color', newFilters.color.join(','))
      if (newFilters.pattern?.length) params.append('pattern', newFilters.pattern.join(','))
      if (newFilters.collection_id) params.append('collection_id', newFilters.collection_id)
      if (newFilters.tags?.length) params.append('tags', newFilters.tags.join(','))
      if (newFilters.stock_status) params.append('stock_status', newFilters.stock_status)
      if (newFilters.price_range?.min) params.append('min_price', newFilters.price_range.min.toString())
      if (newFilters.price_range?.max && newFilters.price_range.max !== Infinity) {
        params.append('max_price', newFilters.price_range.max.toString())
      }
      
      const response = await fetch(`/api/fabrics?${params}`)
      const result: ApiResponse<Fabric[]> = await response.json()
      
      if (result.success && result.data) {
        setFabrics(result.data)
      }
    } catch (error) {
      console.error('Error fetching filtered fabrics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle upload complete
  const handleUploadComplete = (images: GalleryImage[]) => {
    console.log('Upload completed:', images)
    // TODO: Associate images with fabric or create new fabric
    // For now, just refresh the fabrics list
    fetchFilteredFabrics(filters)
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, search: searchTerm }
    setFilters(newFilters)
    fetchFilteredFabrics(newFilters)
  }

  // Handle filter change
  const handleFilterChange = (newFilters: FabricFilter) => {
    setFilters(newFilters)
    fetchFilteredFabrics(newFilters)
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    fetchFilteredFabrics({})
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-30"
      >
        <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
          {/* Mobile Menu + Logo */}
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900 hidden sm:block">
              {t('fabric.title')}
            </h1>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('placeholders.searchFabrics')}
                className="w-40 sm:w-60 lg:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-20 transition-all"
              />
            </form>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3 lg:px-4 py-2 bg-cyan-500 text-white text-sm font-medium rounded-lg hover:bg-cyan-600 transition-colors active:scale-95"
            >
              <PlusIcon className="w-5 h-5" strokeWidth={2} />
              <span className="hidden sm:inline">{t('common.addNew')}</span>
            </button>
            {/* User Avatar Placeholder */}
            <div className="hidden lg:flex w-9 h-9 bg-gray-200 rounded-full items-center justify-center">
              <span className="text-sm font-medium text-gray-600">U</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop Filters - Horizontal Bar */}
      {!isMobile && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FabricFilters
            collections={collections}
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </motion.div>
      )}

      {/* Mobile Filters Bottom Sheet */}
      <AnimatePresence>
        {isMobile && mobileFiltersOpen && (
          <FabricFilters
            collections={collections}
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={clearFilters}
            isMobile={true}
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1">
        <div className="px-4 lg:px-8 py-6 lg:py-8">
          {/* Section Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 flex items-center justify-between"
          >
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
              {t('fabric.title')}
            </h2>
            <span className="text-sm text-gray-600">
              {fabrics.length} {fabrics.length === 1 ? 'mẫu' : 'mẫu'}
            </span>
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"
              />
              <span className="mt-3 text-gray-600 font-medium">{t('common.loading')}</span>
            </div>
          ) : fabrics.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl border border-gray-200 p-12 lg:p-16 text-center"
            >
              <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('messages.noFabrics')}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {t('messages.tryDifferent')}
              </p>
              <button
                onClick={clearFilters}
                className="text-cyan-500 hover:text-cyan-600 font-medium text-sm transition-colors active:scale-95"
              >
                {t('filters.clearFilters')}
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-6">
              {fabrics.map((fabric, index) => (
                <motion.div
                  key={fabric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <FabricCard fabric={fabric} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <FabricUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          setUploadModalOpen(false)
          fetchFilteredFabrics(filters)
        }}
      />
    </div>
  )
}
