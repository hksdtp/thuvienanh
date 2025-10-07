'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AlbumsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/albums/fabric')
  }, [router])

  return (
    <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue border-t-transparent"></div>
    </div>
  )
}

function OldAlbumsPage() {
  const router = useRouter()
  const fetchAlbums = async (newFilters?: any) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      const activeFilters = newFilters || filters
      
      if (activeFilters.search) params.append('search', activeFilters.search)
      if (activeFilters.category) params.append('category', activeFilters.category)
      if (activeFilters.tags?.length) params.append('tags', activeFilters.tags.join(','))
      if (activeFilters.created_by) params.append('created_by', activeFilters.created_by)
      if (activeFilters.date_range?.start) params.append('start_date', activeFilters.date_range.start.toISOString())
      if (activeFilters.date_range?.end) params.append('end_date', activeFilters.date_range.end.toISOString())
      
      const response = await fetch(`/api/albums?${params}`)
      const result: ApiResponse<Album[]> = await response.json()
      
      if (result.success && result.data) {
        // Parse dates properly
        const albumsWithDates = result.data.map(album => ({
          ...album,
          created_at: new Date(album.created_at),
          updated_at: new Date(album.updated_at)
        }))
        setAlbums(albumsWithDates)
      }
    } catch (error) {
      console.error('Error fetching albums:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchAlbums()
  }, [])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, search: searchTerm }
    setFilters(newFilters)
    fetchAlbums(newFilters)
  }

  // Handle filter change
  const handleFilterChange = (newFilters: AlbumFilter) => {
    setFilters(newFilters)
    fetchAlbums(newFilters)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setFilters({})
    fetchAlbums({})
  }

  // Handle create album
  const handleCreateAlbum = async (data: CreateAlbumForm) => {
    try {
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          category: data.category || 'other' // Default to 'other' if not specified
        })
      })

      const result: ApiResponse<Album> = await response.json()

      if (result.success && result.data) {
        setAlbums(prev => [result.data!, ...prev])
        alert('Tạo album thành công!')
      } else {
        alert(`Lỗi: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating album:', error)
      alert('Có lỗi xảy ra khi tạo album')
    }
  }

  // Handle edit album
  const handleEditAlbum = async (album: Album, data: CreateAlbumForm) => {
    try {
      const response = await fetch(`/api/albums/${album.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result: ApiResponse<Album> = await response.json()

      if (result.success && result.data) {
        setAlbums(prev => prev.map(a => a.id === album.id ? result.data! : a))
        alert('Cập nhật album thành công!')
      } else {
        alert(`Lỗi: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating album:', error)
      alert('Có lỗi xảy ra khi cập nhật album')
    }
  }

  // Handle delete album
  const handleDeleteAlbum = async (albumId: string) => {
    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: 'DELETE'
      })

      const result: ApiResponse<{ deleted: boolean }> = await response.json()

      if (result.success) {
        setAlbums(prev => prev.filter(a => a.id !== albumId))
        alert('Xóa album thành công!')
      } else {
        alert(`Lỗi: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting album:', error)
      alert('Có lỗi xảy ra khi xóa album')
    }
  }

  // Handle view album
  const handleViewAlbum = (album: Album) => {
    router.push(`/albums/${album.id}`)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Filters Sidebar - Always visible */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Bộ lọc</h3>
          </div>

          {/* Filters */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange({ ...filters, category: e.target.value as any || undefined })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="fabric">Vải</option>
                <option value="collection">Bộ sưu tập</option>
                <option value="project">Dự án</option>
                <option value="season">Mùa</option>
                <option value="client">Khách hàng</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Albums</h1>

            {/* Create Album Button */}
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tạo Album
            </button>
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
                placeholder="Tìm kiếm album..."
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
          ) : albums.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <PhotoIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có album nào
              </h3>
              <p className="text-gray-600 mb-6">
                Tạo album đầu tiên để bắt đầu tổ chức ảnh
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Tạo Album
              </button>
            </div>
          ) : (
            <AlbumGrid
              albums={albums}
              loading={loading}
              onAlbumCreate={handleCreateAlbum}
              onAlbumEdit={handleEditAlbum}
              onAlbumDelete={handleDeleteAlbum}
              onAlbumView={handleViewAlbum}
              columns={4}
            />
          )}
        </div>
      </div>

      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={async (data: CreateAlbumForm) => {
          try {
            await handleCreateAlbum(data)
            setCreateModalOpen(false)
            fetchAlbums() // Refresh albums list
          } catch (error) {
            console.error('Error creating album:', error)
          }
        }}
      />
    </div>
  )
}
