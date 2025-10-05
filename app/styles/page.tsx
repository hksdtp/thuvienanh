'use client'

import { useState, useEffect } from 'react'
import { SparklesIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import PageHeader from '@/components/PageHeader'
import Image from 'next/image'

interface Style {
  id: string
  name: string
  slug: string
  description: string
  image_url?: string
  is_featured: boolean
}

export default function StylesPage() {
  const [styles, setStyles] = useState<Style[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFeatured, setFilterFeatured] = useState<string>('all')

  useEffect(() => {
    fetchStyles()
  }, [])

  const fetchStyles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/styles')
      const result = await response.json()
      if (result.success && result.data) {
        setStyles(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStyles = styles.filter(style => {
    const matchesSearch = style.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFeatured = filterFeatured === 'all' ||
      (filterFeatured === 'featured' && style.is_featured) ||
      (filterFeatured === 'regular' && !style.is_featured)
    return matchesSearch && matchesFeatured
  })

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title="Phong Cách"
        subtitle={`${styles.length} phong cách thiết kế`}
        icon={<SparklesIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <button className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md">
            <PlusIcon className="w-5 h-5" strokeWidth={2} />
            <span>Thêm mới</span>
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
              placeholder="Tìm kiếm phong cách..."
              className="block w-full pl-10 pr-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              className="px-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white text-macos-text-primary focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            >
              <option value="all">Tất cả phong cách</option>
              <option value="featured">Nổi bật</option>
              <option value="regular">Thông thường</option>
            </select>

            {filterFeatured !== 'all' && (
              <button
                onClick={() => setFilterFeatured('all')}
                className="px-4 py-2.5 text-sm text-ios-blue hover:text-ios-blue-dark font-medium transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
            <span className="ml-3 text-macos-text-secondary font-medium">Đang tải...</span>
          </div>
        ) : filteredStyles.length === 0 ? (
          <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
            <SparklesIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
              Chưa có phong cách nào
            </h3>
            <p className="text-sm text-macos-text-secondary">
              Bắt đầu bằng cách thêm phong cách thiết kế mới
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
            {filteredStyles.map((style, index) => (
              <div
                key={style.id}
                className="animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light group cursor-pointer">
                  <div className="aspect-[4/3] relative overflow-hidden bg-ios-gray-50">
                    {style.image_url ? (
                      <Image
                        src={style.image_url}
                        alt={style.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <SparklesIcon className="w-12 h-12 text-ios-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-macos-text-primary truncate">
                      {style.name}
                    </h3>
                    <p className="text-sm text-macos-text-secondary truncate mt-1">
                      {style.description || 'Không có mô tả'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}