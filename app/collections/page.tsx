'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FolderIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Collection, ApiResponse } from '@/types/database'
import PageHeader from '@/components/PageHeader'
import CollectionCard from '@/components/CollectionCard'
import { t } from '@/lib/translations'

export default function CollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa collection này?')) {
      return
    }

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh collections list
        fetchCollections()
      } else {
        alert('Không thể xóa collection')
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      alert('Có lỗi xảy ra khi xóa collection')
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
        title={t('collections.title') || 'Bộ Sưu Tập'}
        subtitle={`${collections.length} ${t('collections.items') || 'bộ sưu tập'}`}
        icon={<FolderIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreateModal(true)} className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md">
            <PlusIcon className="w-5 h-5" strokeWidth={2} />
            <span>{t('common.create') || 'Tạo mới'}</span>
          </motion.button>
        }
      />

      <div className="px-4 lg:px-8 py-6 lg:py-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 space-y-4">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-ios-gray-500" strokeWidth={2} />
            </div>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('placeholders.searchCollections') || 'Tìm kiếm bộ sưu tập...'} className="block w-full pl-10 pr-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all" />
          </div>

          <div className="flex items-center gap-3">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white text-macos-text-primary focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all">
              <option value="newest">{t('sort.newest') || 'Mới nhất'}</option>
              <option value="oldest">{t('sort.oldest') || 'Cũ nhất'}</option>
              <option value="name_asc">{t('sort.nameAsc') || 'Tên A-Z'}</option>
              <option value="name_desc">{t('sort.nameDesc') || 'Tên Z-A'}</option>
              <option value="most_items">{t('sort.mostItems') || 'Nhiều vải nhất'}</option>
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent" />
            <span className="mt-3 text-gray-600 font-medium">{t('common.loading') || 'Đang tải...'}</span>
          </div>
        ) : filteredCollections.length === 0 ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl border border-macos-border-light p-12 lg:p-16 text-center">
            <FolderIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-macos-text-primary mb-2">{t('messages.noCollections') || 'Chưa có bộ sưu tập nào'}</h3>
            <p className="text-sm text-macos-text-secondary mb-6">{searchTerm ? (t('messages.noSearchResults') || 'Không tìm thấy kết quả') : 'Bắt đầu bằng cách tạo bộ sưu tập mới'}</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreateModal(true)} className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all">
              <PlusIcon className="w-5 h-5" strokeWidth={2} />
              <span>{t('common.create') || 'Tạo mới'}</span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {filteredCollections.map((collection, index) => (
              <motion.div key={collection.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}>
                <CollectionCard collection={collection} onDelete={handleDelete} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

