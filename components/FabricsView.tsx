'use client'

import { useState, useEffect } from 'react'
import StandardCard from './cards/StandardCard'
import CardSkeleton from './cards/CardSkeleton'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

interface Fabric {
  id: string
  name: string
  description: string
  image_url: string
  created_at: string
}

export default function FabricsView() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchFabrics = async () => {
      try {
        const response = await fetch('/api/fabrics')
        const data = await response.json()
        setFabrics(data.data || [])
      } catch (error) {
        console.error('Error fetching fabrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFabrics()
  }, [])

  // Filter fabrics based on search
  const filteredFabrics = fabrics.filter(fabric =>
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div
        className="max-w-[1400px] mx-auto"
        style={{
          paddingLeft: 'var(--space-5)',
          paddingRight: 'var(--space-5)',
          paddingTop: 'var(--space-8)',
          paddingBottom: 'var(--space-12)'
        }}
      >
        
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span className="text-overline text-secondary">THƯ VIỆN</span>
          <h1 className="text-display text-primary mt-2 mb-4">Vải</h1>
          <p className="text-body text-secondary max-w-2xl">
            Khám phá bộ sưu tập vải đa dạng với nhiều màu sắc, chất liệu và họa tiết khác nhau
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div
          className="flex"
          style={{
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-8)'
          }}
        >
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm vải..."
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

          <button
            className="flex items-center transition-all hover:scale-105 active:scale-95"
            style={{
              paddingLeft: 'var(--space-6)',
              paddingRight: 'var(--space-6)',
              paddingTop: 'var(--space-3)',
              paddingBottom: 'var(--space-3)',
              gap: 'var(--space-2)',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)'
            }}
          >
            <FunnelIcon className="h-5 w-5" />
            <span className="hidden md:inline text-headline">Lọc</span>
          </button>
        </div>

        {/* Results Count */}
        {!loading && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <p className="text-body-small text-secondary">
              {filteredFabrics.length} {filteredFabrics.length === 1 ? 'kết quả' : 'kết quả'}
            </p>
          </div>
        )}

        {/* Fabrics Grid */}
        {loading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ gap: 'var(--space-4)' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <CardSkeleton key={i} variant="standard" aspectRatio="3/4" />
            ))}
          </div>
        ) : filteredFabrics.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: 'var(--text-quaternary)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-title3 text-primary mb-2">Không tìm thấy kết quả</h3>
            <p className="text-body-small text-secondary">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ gap: 'var(--space-4)' }}
          >
            {filteredFabrics.map((fabric, index) => (
              <div 
                key={fabric.id}
                className="stagger-item"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <StandardCard
                  title={fabric.name}
                  description={fabric.description}
                  category="Vải"
                  imageUrl={fabric.image_url || '/placeholder.jpg'}
                  href={`/fabrics/${fabric.id}`}
                  aspectRatio="3/4"
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}

