'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, PhotoIcon, PlusIcon, SparklesIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { Fabric, Collection, ApiResponse, FabricFilter } from '@/types/database'

import FabricCard from '@/components/FabricCard'
import FabricFilters from '@/components/FabricFilters'
import FabricUploadModal from '@/components/FabricUploadModal'
import { GalleryImage } from '@/components/ImageGallery'
import PageHeader from '@/components/PageHeader'
import { fabricsApi, collectionsApi } from '@/lib/api-client'
import { t } from '@/lib/translations'

export default function FabricsNewPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter for fabrics created in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [filters, setFilters] = useState<FabricFilter>({
    created_after: thirtyDaysAgo.toISOString(),
    category: 'new' // Add category filter
  })
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      
      // Always include created_after filter and category
      const newFabricsFilters = {
        ...newFilters,
        created_after: thirtyDaysAgo.toISOString(),
        category: 'new'
      }
      
      const params = new URLSearchParams()
      
      if (newFabricsFilters.search) params.append('search', newFabricsFilters.search)
      if (newFabricsFilters.material?.length) params.append('material', newFabricsFilters.material.join(','))
      if (newFabricsFilters.color?.length) params.append('color', newFabricsFilters.color.join(','))
      if (newFabricsFilters.pattern?.length) params.append('pattern', newFabricsFilters.pattern.join(','))
      if (newFabricsFilters.collection_id) params.append('collection_id', newFabricsFilters.collection_id)
      if (newFabricsFilters.tags?.length) params.append('tags', newFabricsFilters.tags.join(','))
      if (newFabricsFilters.stock_status) params.append('stock_status', newFabricsFilters.stock_status)
      if (newFabricsFilters.price_range?.min) params.append('min_price', newFabricsFilters.price_range.min.toString())
      if (newFabricsFilters.price_range?.max && newFabricsFilters.price_range.max !== Infinity) {
        params.append('max_price', newFabricsFilters.price_range.max.toString())
      }
      if (newFabricsFilters.created_after) {
        params.append('created_after', newFabricsFilters.created_after)
      }
      params.append('category', 'new')

      const response = await fetch(`/api/fabrics?${params.toString()}`)
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

  const handleFilterChange = (newFilters: FabricFilter) => {
    setFilters({
      ...newFilters,
      created_after: thirtyDaysAgo.toISOString(),
      category: 'new'
    })
    fetchFilteredFabrics(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FabricFilter = {
      created_after: thirtyDaysAgo.toISOString(),
      category: 'new'
    }
    setFilters(defaultFilters)
    setSearchTerm('')
    fetchFilteredFabrics(defaultFilters)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const newFilters = { ...filters, search: term }
    setFilters(newFilters)
    fetchFilteredFabrics(newFilters)
  }

  const handleUploadSuccess = () => {
    setUploadModalOpen(false)
    // Refresh fabrics list
    fetchFilteredFabrics(filters)
  }

  // Filter fabrics by search term (client-side)
  const filteredFabrics = fabrics.filter(fabric =>
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title={t('fabric.newTitle') || 'Vải Mới'}
        subtitle={`${filteredFabrics.length} ${t('fabric.items') || 'mẫu vải'} (30 ngày gần đây)`}
        icon={<SparklesIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <div className="flex items-center gap-3">
            {isMobile && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" strokeWidth={2} />
                <span>{t('filters.filters') || 'Bộ lọc'}</span>
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md"
            >
              <PlusIcon className="w-5 h-5" strokeWidth={2} />
              <span>{t('common.add') || 'Thêm mới'}</span>
            </motion.button>
          </div>
        }
      />

      {isMobile && (
        <div className="px-4 py-4 bg-white border-b border-gray-200">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-macos-text-tertiary" />
              <input
                type="text"
                placeholder={t('placeholders.searchFabrics') || 'Tìm kiếm vải...'}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-macos-text-primary placeholder-macos-text-tertiary focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all"
              />
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex">
        {!isMobile && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-64 bg-white border-r border-gray-200 flex-shrink-0 sticky top-0 self-start"
          >
            <FabricFilters
              filters={filters}
              collections={collections}
              onFiltersChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </motion.div>
        )}

        <AnimatePresence>
          {isMobile && mobileFiltersOpen && (
            <FabricFilters
              filters={filters}
              collections={collections}
              onFiltersChange={handleFilterChange}
              onClearFilters={clearFilters}
              isMobile={true}
              isOpen={mobileFiltersOpen}
              onClose={() => setMobileFiltersOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="flex-1">
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            {!isMobile && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-macos-text-tertiary" />
                  <input
                    type="text"
                    placeholder={t('placeholders.searchFabrics') || 'Tìm kiếm vải theo tên, mã, mô tả...'}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-macos-border-light rounded-lg text-sm text-macos-text-primary placeholder-macos-text-tertiary focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all"
                  />
                </div>
              </motion.div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent" />
                <span className="mt-3 text-gray-600 font-medium">{t('common.loading') || 'Đang tải...'}</span>
              </div>
            ) : filteredFabrics.length === 0 ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl p-12 lg:p-16 text-center border border-macos-border-light">
                <PhotoIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-macos-text-primary mb-2">{t('messages.noFabrics') || 'Chưa có vải mới nào'}</h3>
                <p className="text-sm text-macos-text-secondary mb-6">
                  {searchTerm ? (t('messages.noSearchResults') || 'Không tìm thấy vải phù hợp') : 'Thêm vải đầu tiên vào danh mục Vải Mới'}
                </p>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setUploadModalOpen(true)} className="inline-flex items-center space-x-2 px-6 py-3 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all">
                  <PlusIcon className="w-5 h-5" strokeWidth={2} />
                  <span>{t('common.add') || 'Thêm mới'}</span>
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredFabrics.map((fabric, index) => (
                  <motion.div key={fabric.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}>
                    <FabricCard fabric={fabric} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <FabricUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
          category="new"
        />
      )}
    </div>
  )
}

