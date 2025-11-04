'use client'

import { useState, useEffect } from 'react'
import StandardCard from './cards/StandardCard'
import CardSkeleton from './cards/CardSkeleton'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface Album {
  id: string
  name: string
  description: string
  cover_photo_url: string
  created_at: string
}

export default function AlbumsView() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch('/api/albums')
        const data = await response.json()
        setAlbums(data.data || [])
      } catch (error) {
        console.error('Error fetching albums:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [])

  const filteredAlbums = albums.filter(album =>
    album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main 
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-6 py-8 md:py-12">
        
        <div className="mb-8">
          <span className="text-overline text-secondary">THƯ VIỆN ẢNH</span>
          <h1 className="text-display text-primary mt-2 mb-4">Albums</h1>
          <p className="text-body text-secondary max-w-2xl">
            Bộ sưu tập hình ảnh từ các dự án và sự kiện
          </p>
        </div>

        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm album..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-body transition-all"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        {!loading && (
          <div className="mb-6">
            <p className="text-body-small text-secondary">
              {filteredAlbums.length} album
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <CardSkeleton key={i} variant="standard" aspectRatio="1/1" />
            ))}
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-title3 text-primary mb-2">Không tìm thấy album</h3>
            <p className="text-body-small text-secondary">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAlbums.map((album, index) => (
              <div 
                key={album.id}
                className="stagger-item"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <StandardCard
                  title={album.name}
                  description={album.description}
                  category="Album"
                  imageUrl={album.cover_photo_url || '/placeholder.jpg'}
                  href={`/albums/${album.id}`}
                  aspectRatio="1/1"
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}

