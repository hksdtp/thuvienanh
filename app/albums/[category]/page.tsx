'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoIcon, WrenchScrewdriverIcon, CalendarDaysIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import PageHeader from '@/components/PageHeader'
import CreateAlbumModal from '@/components/CreateAlbumModal'
import EditAlbumModal from '@/components/EditAlbumModal'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { CreateAlbumForm, Album } from '@/types/database'
import Image from 'next/image'

const VALID_CATEGORIES = {
  'fabric': {
    title: 'Albums Vải',
    subtitle: 'Thư viện ảnh các loại vải mẫu',
    icon: PhotoIcon,
    dbValue: 'fabric'
  },
  'accessory': {
    title: 'Albums Phụ Kiện',
    subtitle: 'Thư viện ảnh phụ kiện rèm cửa',
    icon: WrenchScrewdriverIcon,
    dbValue: 'accessory'
  },
  'event': {
    title: 'Albums Sự Kiện',
    subtitle: 'Thư viện ảnh sự kiện công ty',
    icon: CalendarDaysIcon,
    dbValue: 'event'
  }
} as const

type CategorySlug = keyof typeof VALID_CATEGORIES

interface PageProps {
  params: {
    category: string
  }
}

export default function AlbumsCategoryPage({ params }: PageProps) {
  const router = useRouter()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)

  const categoryInfo = VALID_CATEGORIES[params.category as CategorySlug]

  useEffect(() => {
    if (categoryInfo) {
      fetchAlbums()
    }
  }, [params.category])

  const fetchAlbums = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/albums/${params.category}`)
      const result = await response.json()
      if (result.success && result.data) {
        setAlbums(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAlbum = (album: Album, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setSelectedAlbum(album)
    setEditModalOpen(true)
  }

  const handleUpdateAlbum = async (data: { name: string; description?: string; tags?: string[] }) => {
    if (!selectedAlbum) return

    try {
      const response = await fetch(`/api/albums/by-id/${selectedAlbum.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        await fetchAlbums() // Refresh list
        setEditModalOpen(false)
        setSelectedAlbum(null)
      } else {
        throw new Error(result.error || 'Failed to update album')
      }
    } catch (error) {
      console.error('Error updating album:', error)
      throw error
    }
  }

  const handleDeleteAlbum = async (album: Album, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click

    const confirmed = confirm(`Bạn có chắc muốn xóa album "${album.name}"?\n\nChọn OK để vô hiệu hóa (soft delete) hoặc Cancel để hủy.`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/albums/by-id/${album.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchAlbums() // Refresh list
      } else {
        throw new Error(result.error || 'Failed to delete album')
      }
    } catch (error) {
      console.error('Error deleting album:', error)
      alert('Có lỗi xảy ra khi xóa album')
    }
  }

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-macos-text-primary mb-2">Không tìm thấy danh mục</h2>
          <p className="text-sm text-macos-text-secondary mb-4">Danh mục "{params.category}" không tồn tại</p>
          <button
            onClick={() => router.push('/')}
            className="text-ios-blue hover:text-ios-blue-dark font-medium"
          >
            ← Về trang chủ
          </button>
        </div>
      </div>
    )
  }

  const Icon = categoryInfo.icon

  const filteredAlbums = albums.filter(album =>
    album.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title={categoryInfo.title}
        subtitle={`${albums.length} albums`}
        icon={<Icon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md"
          >
            <PlusIcon className="w-5 h-5" strokeWidth={2} />
            <span>Tạo album</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-ios-gray-500" strokeWidth={2} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm album..."
              className="block w-full pl-10 pr-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
            <span className="ml-3 text-macos-text-secondary font-medium">Đang tải...</span>
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
            <Icon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
              Chưa có album nào
            </h3>
            <p className="text-sm text-macos-text-secondary">
              Bắt đầu tạo album mới cho {categoryInfo.title.toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
            {filteredAlbums.map((album, index) => (
              <div
                key={album.id}
                className="animate-slideUp cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => router.push(`/albums/${params.category}/${album.id}`)}
              >
                <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light group">
                  <div className="aspect-[4/3] relative overflow-hidden bg-ios-gray-50">
                    {album.cover_image_url ? (
                      <Image
                        src={album.cover_image_url}
                        alt={album.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-12 h-12 text-ios-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                    {/* Action buttons - show on hover */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditAlbum(album, e)}
                        className="p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="w-4 h-4 text-ios-blue" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteAlbum(album, e)}
                        className="p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all"
                        title="Xóa"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-macos-text-primary truncate">
                      {album.name}
                    </h3>
                    <p className="text-sm text-macos-text-secondary truncate mt-1">
                      {album.description || 'Không có mô tả'}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-macos-border-light">
                      <span className="text-xs text-macos-text-secondary">
                        {album.image_count || 0} ảnh
                      </span>
                      <span className="text-xs text-macos-text-secondary">
                        {new Date(album.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={async (data: CreateAlbumForm) => {
          try {
            const response = await fetch('/api/albums', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                ...data,
                category: categoryInfo.dbValue
              })
            })

            const result = await response.json()

            if (result.success && result.data) {
              setCreateModalOpen(false)
              fetchAlbums() // Refresh albums list
            } else {
              alert(`Lỗi: ${result.error}`)
            }
          } catch (error) {
            console.error('Error creating album:', error)
            alert('Có lỗi xảy ra khi tạo album')
          }
        }}
      />

      {/* Edit Album Modal */}
      <EditAlbumModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedAlbum(null)
        }}
        onSubmit={handleUpdateAlbum}
        album={selectedAlbum}
      />
    </div>
  )
}