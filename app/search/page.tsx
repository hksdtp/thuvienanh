'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import PageHeader from '@/components/PageHeader'
import FabricCard from '@/components/FabricCard'
import CollectionCard from '@/components/CollectionCard'
import ProjectCard from '@/components/ProjectCard'
import EventCard from '@/components/EventCard'

interface SearchResults {
  fabrics: any[]
  collections: any[]
  projects: any[]
  events: any[]
  styles: any[]
  accessories: any[]
}

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'fabrics', name: 'Vải Mẫu' },
  { id: 'collections', name: 'Bộ Sưu Tập' },
  { id: 'projects', name: 'Công Trình' },
  { id: 'events', name: 'Sự Kiện' },
  { id: 'styles', name: 'Phong Cách' },
  { id: 'accessories', name: 'Phụ Kiện' }
]

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [activeCategory, setActiveCategory] = useState('all')
  const [results, setResults] = useState<SearchResults>({
    fabrics: [],
    collections: [],
    projects: [],
    events: [],
    styles: [],
    accessories: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchTerm(query)
      performSearch(query)
    }
  }, [searchParams])

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults({
        fabrics: [],
        collections: [],
        projects: [],
        events: [],
        styles: [],
        accessories: []
      })
      return
    }

    setLoading(true)
    try {
      const [fabricsRes, collectionsRes, projectsRes, eventsRes, stylesRes, accessoriesRes] = await Promise.all([
        fetch(`/api/fabrics?search=${encodeURIComponent(query)}`),
        fetch(`/api/collections?search=${encodeURIComponent(query)}`),
        fetch(`/api/projects?search=${encodeURIComponent(query)}`),
        fetch(`/api/events?search=${encodeURIComponent(query)}`),
        fetch(`/api/styles?search=${encodeURIComponent(query)}`),
        fetch(`/api/accessories/phu-kien-trang-tri?search=${encodeURIComponent(query)}`)
      ])

      const [fabrics, collections, projects, events, styles, accessories] = await Promise.all([
        fabricsRes.json(),
        collectionsRes.json(),
        projectsRes.json(),
        eventsRes.json(),
        stylesRes.json(),
        accessoriesRes.json()
      ])

      setResults({
        fabrics: fabrics.success ? fabrics.data : [],
        collections: collections.success ? collections.data : [],
        projects: projects.success ? projects.data : [],
        events: events.success ? events.data : [],
        styles: styles.success ? styles.data : [],
        accessories: accessories.success ? accessories.data : []
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
      performSearch(searchTerm)
    }
  }

  const getTotalResults = () => {
    return Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
  }

  const getFilteredResults = () => {
    if (activeCategory === 'all') return results
    return {
      ...results,
      fabrics: activeCategory === 'fabrics' ? results.fabrics : [],
      collections: activeCategory === 'collections' ? results.collections : [],
      projects: activeCategory === 'projects' ? results.projects : [],
      events: activeCategory === 'events' ? results.events : [],
      styles: activeCategory === 'styles' ? results.styles : [],
      accessories: activeCategory === 'accessories' ? results.accessories : []
    }
  }

  const filteredResults = getFilteredResults()
  const hasResults = getTotalResults() > 0

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title="Tìm kiếm"
        subtitle={searchTerm ? `Kết quả cho "${searchTerm}"` : 'Tìm kiếm trong tất cả danh mục'}
        icon={<MagnifyingGlassIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-6 w-6 text-ios-gray-500" strokeWidth={2} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm vải, bộ sưu tập, công trình, sự kiện..."
              className="block w-full pl-14 pr-6 py-4 border border-ios-gray-300 rounded-xl text-base bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all shadow-sm"
              autoFocus
            />
          </div>
        </form>

        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === category.id
                  ? 'bg-ios-blue text-white shadow-sm'
                  : 'bg-white text-macos-text-secondary hover:bg-ios-gray-50 border border-macos-border-light'
              }`}
            >
              {category.name}
              {category.id !== 'all' && results[category.id as keyof SearchResults]?.length > 0 && (
                <span className="ml-2 opacity-75">
                  ({results[category.id as keyof SearchResults].length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
            <span className="ml-3 text-macos-text-secondary font-medium">Đang tìm kiếm...</span>
          </div>
        ) : !searchTerm ? (
          <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
            <MagnifyingGlassIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
              Bắt đầu tìm kiếm
            </h3>
            <p className="text-sm text-macos-text-secondary">
              Nhập từ khóa để tìm kiếm trong tất cả danh mục
            </p>
          </div>
        ) : !hasResults ? (
          <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
            <MagnifyingGlassIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-sm text-macos-text-secondary">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {filteredResults.fabrics.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-macos-text-primary mb-4">
                  Vải Mẫu ({filteredResults.fabrics.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResults.fabrics.slice(0, 8).map((fabric, index) => (
                    <div key={fabric.id} className="animate-slideUp" style={{ animationDelay: `${index * 30}ms` }}>
                      <FabricCard fabric={fabric} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filteredResults.collections.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-macos-text-primary mb-4">
                  Bộ Sưu Tập ({filteredResults.collections.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResults.collections.slice(0, 8).map((collection, index) => (
                    <div key={collection.id} className="animate-slideUp" style={{ animationDelay: `${index * 30}ms` }}>
                      <CollectionCard collection={collection} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filteredResults.projects.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-macos-text-primary mb-4">
                  Công Trình ({filteredResults.projects.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResults.projects.slice(0, 8).map((project, index) => (
                    <div key={project.id} className="animate-slideUp" style={{ animationDelay: `${index * 30}ms` }}>
                      <ProjectCard project={project} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filteredResults.events.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-macos-text-primary mb-4">
                  Sự Kiện ({filteredResults.events.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResults.events.slice(0, 8).map((event, index) => (
                    <div key={event.id} className="animate-slideUp" style={{ animationDelay: `${index * 30}ms` }}>
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filteredResults.styles.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-macos-text-primary mb-4">
                  Phong Cách ({filteredResults.styles.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResults.styles.slice(0, 8).map((style, index) => (
                    <div
                      key={style.id}
                      className="animate-slideUp bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <a href={`/styles/${style.id}`} className="block">
                        {style.thumbnail_url && (
                          <div className="aspect-[4/3] relative overflow-hidden bg-ios-gray-50">
                            <img
                              src={style.thumbnail_url}
                              alt={style.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-macos-text-primary mb-1 group-hover:text-ios-blue transition-colors">
                            {style.name}
                          </h3>
                          {style.description && (
                            <p className="text-sm text-macos-text-secondary line-clamp-2">
                              {style.description}
                            </p>
                          )}
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filteredResults.accessories.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-macos-text-primary mb-4">
                  Phụ Kiện ({filteredResults.accessories.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResults.accessories.slice(0, 8).map((accessory, index) => (
                    <div
                      key={accessory.id}
                      className="animate-slideUp bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <a href={`/accessories/${accessory.category}/${accessory.id}`} className="block">
                        {accessory.image_url && (
                          <div className="aspect-square relative overflow-hidden bg-ios-gray-50">
                            <img
                              src={accessory.image_url}
                              alt={accessory.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-macos-text-primary mb-1 group-hover:text-ios-blue transition-colors">
                            {accessory.name}
                          </h3>
                          <p className="text-xs text-macos-text-secondary mb-2">
                            {accessory.code}
                          </p>
                          {accessory.price && (
                            <p className="text-sm font-medium text-ios-blue">
                              {accessory.price.toLocaleString('vi-VN')}đ
                            </p>
                          )}
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}