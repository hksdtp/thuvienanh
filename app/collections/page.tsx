'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FolderIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Collection, ApiResponse } from '@/types/database'
import PageHeader from '@/components/PageHeader'
import CollectionCard from '@/components/CollectionCard'

export default function CollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sortBy, setSortBy] = useState<string>('newest')

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/collections')
      const result: ApiResponse<Collection[]> = await response.json()
      if (result.success && result.data) {
        setCollections(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCollections = collections
    .filter(collection =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name_asc':
          return a.name.localeCompare(b.name)
        case 'name_desc':
          return b.name.localeCompare(a.name)
        case 'most_items':
          return (b.fabric_count || 0) - (a.fabric_count || 0)
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title="Bộ Sưu Tập"
        subtitle={`${collections.length} bộ sưu tập`}
        icon={<FolderIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md"
          >
            <PlusIcon className="w-5 h-5" strokeWidth={2} />
            <span>Tạo bộ sưu tập</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 space-y-4">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-ios-gray-500" strokeWidth={2} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bộ sưu tập..."
              className="block w-full pl-10 pr-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white text-macos-text-primary focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="most_items">Nhiều vải nhất</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
            <span className="ml-3 text-macos-text-secondary font-medium">Đang tải...</span>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
            <FolderIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
              Chưa có bộ sưu tập nào
            </h3>
            <p className="text-sm text-macos-text-secondary mb-6">
              Bắt đầu bằng cách tạo bộ sưu tập mới
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all"
            >
              <PlusIcon className="w-5 h-5" strokeWidth={2} />
              <span>Tạo bộ sưu tập</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
            {filteredCollections.map((collection, index) => (
              <div
                key={collection.id}
                className="animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CollectionCard collection={collection} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

