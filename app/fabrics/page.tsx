'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Fabric, Collection, ApiResponse, FabricFilter } from '@/types/database'

import FabricCard from '@/components/FabricCard'
import FabricFilters from '@/components/FabricFilters'
import FabricUploadModal from '@/components/FabricUploadModal'
import { GalleryImage } from '@/components/ImageGallery'
import PageHeader from '@/components/PageHeader'
import { fabricsApi, collectionsApi } from '@/lib/api-client'

export default function FabricsPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FabricFilter>({})
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Fetch fabrics và collections
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch fabrics using API client
        const fabricsData = await fabricsApi.getAll()
        setFabrics(fabricsData)

        // Fetch collections for filter
        const collectionsData = await collectionsApi.getAll()
        setCollections(collectionsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
    <div className="min-h-screen bg-macos-bg-secondary">
      {/* Page Header */}
      <PageHeader
        title="Vải Mẫu"
        subtitle={`${fabrics.length} mẫu vải`}
        icon={<PhotoIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md"
          >
            <PlusIcon className="w-5 h-5" strokeWidth={2} />
            <span>Thêm mới</span>
          </button>
        }
      />

      <div className="flex">
        {/* Filters Sidebar */}
        <div className="w-64 bg-white border-r border-macos-border-light flex-shrink-0 h-[calc(100vh-140px)] sticky top-[140px]">
          <FabricFilters
            collections={collections}
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-ios-gray-500" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm vải..."
                  className="block w-full pl-10 pr-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
                />
              </div>
            </form>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
                <span className="ml-3 text-macos-text-secondary font-medium">Đang tải...</span>
              </div>
            ) : fabrics.length === 0 ? (
              <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
                <PhotoIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
                  Không tìm thấy vải nào
                </h3>
                <p className="text-sm text-macos-text-secondary mb-6">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
                <button
                  onClick={clearFilters}
                  className="text-ios-blue hover:text-ios-blue-dark font-medium text-sm transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
                {fabrics.map((fabric, index) => (
                  <div
                    key={fabric.id}
                    className="animate-slideUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <FabricCard fabric={fabric} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <FabricUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
