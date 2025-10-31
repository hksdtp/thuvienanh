'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FolderIcon,
  HeartIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { Collection, Fabric, ApiResponse } from '@/types/database'
import CreateCollectionModal from '@/components/CreateCollectionModal'
import Image from 'next/image'

// Predefined collections (Yêu thích)
const FAVORITE_COLLECTIONS = [
  { id: 'all', name: 'Tất cả các loại vải', icon: Squares2X2Icon, color: 'blue' },
  { id: 'new', name: 'Hàng mới về', icon: SparklesIcon, color: 'green' },
  { id: 'bestseller', name: 'Vải bán chạy', icon: FireIcon, color: 'red' }
]

export default function CollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedView, setSelectedView] = useState<'all' | 'new' | 'bestseller' | string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch collections từ API
  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      const result: ApiResponse<Collection[]> = await response.json()

      if (result.success && result.data) {
        setCollections(result.data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  // Fetch fabrics based on selected view
  const fetchFabrics = async (view: string) => {
    try {
      setLoading(true)
      let url = '/api/fabrics'

      if (view === 'all') {
        // Tất cả vải
        url = '/api/fabrics'
      } else if (view === 'new') {
        // Hàng mới về (sort by created_at DESC, limit 20)
        url = '/api/fabrics?sort=created_at&order=desc&limit=20'
      } else if (view === 'bestseller') {
        // Vải bán chạy (sort by stock_quantity DESC)
        url = '/api/fabrics?sort=stock_quantity&order=desc&limit=20'
      } else {
        // Collection cụ thể
        url = `/api/collections/${view}/fabrics`
      }

      if (searchTerm) {
        url += `${url.includes('?') ? '&' : '?'}search=${searchTerm}`
      }

      const response = await fetch(url)
      const result: ApiResponse<Fabric[]> = await response.json()

      if (result.success && result.data) {
        setFabrics(result.data)
      }
    } catch (error) {
      console.error('Error fetching fabrics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load collections và fabrics khi component mount
  useEffect(() => {
    fetchCollections()
  }, [])

  // Load fabrics khi selectedView thay đổi
  useEffect(() => {
    fetchFabrics(selectedView)
  }, [selectedView])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFabrics(selectedView)
  }

  // Handle tạo collection thành công
  const handleCollectionCreated = (newCollection: Collection) => {
    setCollections(prev => [newCollection, ...prev])
    setShowCreateModal(false)
  }

  // Handle xóa collection
  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bộ sưu tập này?')) return

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE'
      })

      const result: ApiResponse<null> = await response.json()

      if (result.success) {
        setCollections(prev => prev.filter(c => c.id !== id))
        if (selectedView === id) {
          setSelectedView('all')
        }
      } else {
        alert(result.error || 'Không thể xóa bộ sưu tập')
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      alert('Có lỗi xảy ra khi xóa bộ sưu tập')
    }
  }

  // Get current view title
  const getCurrentViewTitle = () => {
    if (selectedView === 'all') return 'Tất cả các loại vải'
    if (selectedView === 'new') return 'Hàng mới về'
    if (selectedView === 'bestseller') return 'Vải bán chạy'

    const collection = collections.find(c => c.id === selectedView)
    return collection?.name || 'Bộ sưu tập'
  }

  // Collection colors
  const COLLECTION_COLORS = ['pink', 'green', 'yellow', 'purple', 'blue', 'red']
  const getCollectionColor = (index: number) => {
    return COLLECTION_COLORS[index % COLLECTION_COLORS.length]
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex-shrink-0 flex flex-col">
        {/* Header */}


        {/* Yêu thích Section */}
        <div className="px-4 py-4 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Yêu thích
          </h3>
          <div className="space-y-1">
            {FAVORITE_COLLECTIONS.map((item) => {
              const Icon = item.icon
              const isActive = selectedView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedView(item.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bộ sưu tập Section */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Bộ sưu tập
          </h3>
          <div className="space-y-1">
            {collections.map((collection, index) => {
              const isActive = selectedView === collection.id
              const color = getCollectionColor(index)
              const colorClasses = {
                pink: 'text-pink-600',
                green: 'text-green-600',
                yellow: 'text-yellow-600',
                purple: 'text-purple-600',
                blue: 'text-blue-600',
                red: 'text-red-600'
              }

              return (
                <button
                  key={collection.id}
                  onClick={() => setSelectedView(collection.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-200'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <FolderIcon className={`h-4 w-4 ${colorClasses[color as keyof typeof colorClasses]}`} />
                  <span className="flex-1 text-left truncate text-gray-700">{collection.name}</span>
                </button>
              )
            })}

            {/* Add Collection Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Thêm bộ sưu tập</span>
            </button>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => router.push('/fabrics')}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="font-medium">Thêm vải mới</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{getCurrentViewTitle()}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{fabrics.length} mục</p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <Squares2X2Icon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <ListBulletIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch}>
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm vải..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : fabrics.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FolderIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có vải nào
              </h3>
              <p className="text-gray-600 mb-6">
                Thêm vải vào bộ sưu tập để bắt đầu
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
              : 'space-y-2'
            }>
              {fabrics.map((fabric) => (
                viewMode === 'grid' ? (
                  // Grid Card
                  <button
                    key={fabric.id}
                    onClick={() => router.push(`/fabrics/${fabric.id}`)}
                    className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      {fabric.primary_image_url ? (
                        <Image
                          src={fabric.primary_image_url}
                          alt={fabric.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderIcon className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600">
                        {fabric.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{fabric.code}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {fabric.stock_quantity || 0}m
                      </p>
                    </div>
                  </button>
                ) : (
                  // List Item
                  <button
                    key={fabric.id}
                    onClick={() => router.push(`/fabrics/${fabric.id}`)}
                    className="w-full flex items-center space-x-4 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <div className="relative w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                      {fabric.primary_image_url ? (
                        <Image
                          src={fabric.primary_image_url}
                          alt={fabric.name}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderIcon className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-sm text-gray-900">{fabric.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fabric.code} • {fabric.material} • {fabric.color}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {fabric.stock_quantity || 0}m
                      </p>
                    </div>
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCollectionCreated}
        />
      )}
    </div>
  )
}
