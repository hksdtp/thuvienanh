'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, PhotoIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { Fabric, Collection, ApiResponse, FabricFilter } from '@/types/database'

import FabricCard from '@/components/FabricCard'
import FabricFilters from '@/components/FabricFilters'
import FabricUploadModal from '@/components/FabricUploadModal'
import { GalleryImage } from '@/components/ImageGallery'
import PageHeader from '@/components/PageHeader'
import { fabricsApi, collectionsApi } from '@/lib/api-client'

export default function FabricsMOQPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FabricFilter>({
    min_order_quantity: { min: 2, max: 999999 } // MOQ >= 2
  })
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

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
      
      // Always include MOQ filter and category
      const moqFilters = {
        ...newFilters,
        min_order_quantity: { min: 2 },
        category: 'moq'
      }
      
      const params = new URLSearchParams()
      
      if (moqFilters.search) params.append('search', moqFilters.search)
      if (moqFilters.material?.length) params.append('material', moqFilters.material.join(','))
      if (moqFilters.color?.length) params.append('color', moqFilters.color.join(','))
      if (moqFilters.pattern?.length) params.append('pattern', moqFilters.pattern.join(','))
      if (moqFilters.collection_id) params.append('collection_id', moqFilters.collection_id)
      if (moqFilters.tags?.length) params.append('tags', moqFilters.tags.join(','))
      if (moqFilters.stock_status) params.append('stock_status', moqFilters.stock_status)
      if (moqFilters.price_range?.min) params.append('min_price', moqFilters.price_range.min.toString())
      if (moqFilters.price_range?.max && moqFilters.price_range.max !== Infinity) {
        params.append('max_price', moqFilters.price_range.max.toString())
      }
      if (moqFilters.min_order_quantity?.min) {
        params.append('min_moq', moqFilters.min_order_quantity.min.toString())
      }
      params.append('category', 'moq')

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
      min_order_quantity: { min: 2, max: 999999 }
    })
    fetchFilteredFabrics(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: FabricFilter = {
      min_order_quantity: { min: 2, max: 999999 }
    }
    setFilters(clearedFilters)
    fetchFilteredFabrics(clearedFilters)
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
        title="Vải Order theo MOQ"
        subtitle={`${filteredFabrics.length} loại vải có MOQ`}
        icon={<ShoppingCartIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md"
          >
            <PlusIcon className="w-5 h-5" strokeWidth={2} />
            <span>Thêm vải mới</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-macos-text-tertiary" />
            <input
              type="text"
              placeholder="Tìm kiếm vải theo tên, mã, mô tả..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-macos-border-light rounded-lg text-sm text-macos-text-primary placeholder-macos-text-tertiary focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FabricFilters
            filters={filters}
            collections={collections}
            onFiltersChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Fabrics Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue border-t-transparent"></div>
          </div>
        ) : filteredFabrics.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-macos-border-light">
            <PhotoIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-macos-text-primary mb-2">
              Chưa có vải nào
            </h3>
            <p className="text-sm text-macos-text-secondary mb-6">
              {searchTerm ? 'Không tìm thấy vải phù hợp với từ khóa tìm kiếm' : 'Thêm vải đầu tiên vào danh mục MOQ'}
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all"
            >
              <PlusIcon className="w-5 h-5" strokeWidth={2} />
              <span>Thêm vải mới</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFabrics.map((fabric, index) => (
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

      {/* Upload Modal */}
      {uploadModalOpen && (
        <FabricUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
          category="moq"
        />
      )}
    </div>
  )
}

