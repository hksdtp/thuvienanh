'use client'

import { useEffect, useState } from 'react'
import HeroCard from './cards/HeroCard'
import StandardCard from './cards/StandardCard'
import CompactCard from './cards/CompactCard'
import CardSkeleton from './cards/CardSkeleton'
import SectionHeader from './sections/SectionHeader'
import GridSection from './sections/GridSection'
import ScrollSection from './sections/ScrollSection'

interface Fabric {
  id: string
  name: string
  description: string
  image_url: string
  created_at: string
}

interface Collection {
  id: string
  name: string
  description: string
  thumbnail_url: string
  created_at: string
}

interface Project {
  id: string
  name: string
  description: string
  cover_image: string
  created_at: string
}

interface Album {
  id: string
  name: string
  description: string
  cover_photo_url: string
  created_at: string
}

export default function TodayView() {
  const [loading, setLoading] = useState(true)
  const [featuredProject, setFeaturedProject] = useState<Project | null>(null)
  const [latestFabrics, setLatestFabrics] = useState<Fabric[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [albums, setAlbums] = useState<Album[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [fabricsRes, collectionsRes, projectsRes, albumsRes] = await Promise.all([
          fetch('/api/fabrics'),
          fetch('/api/collections'),
          fetch('/api/projects'),
          fetch('/api/albums')
        ])

        const [fabricsData, collectionsData, projectsData, albumsData] = await Promise.all([
          fabricsRes.json(),
          collectionsRes.json(),
          projectsRes.json(),
          albumsRes.json()
        ])

        // Set featured project (first project)
        if (projectsData.data && projectsData.data.length > 0) {
          setFeaturedProject(projectsData.data[0])
        }

        // Set latest fabrics (first 8)
        setLatestFabrics(fabricsData.data?.slice(0, 8) || [])

        // Set collections (first 6)
        setCollections(collectionsData.data?.slice(0, 6) || [])

        // Set projects (skip first, get next 3)
        setProjects(projectsData.data?.slice(1, 4) || [])

        // Set albums (first 4)
        setAlbums(albumsData.data?.slice(0, 4) || [])

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main 
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-6 py-8 md:py-12 space-y-12">
        
        {/* Hero Section - Featured Project */}
        {loading ? (
          <CardSkeleton variant="hero" />
        ) : featuredProject ? (
          <div className="fade-in">
            <HeroCard
              title={featuredProject.name}
              subtitle={featuredProject.description}
              category="CÔNG TRÌNH NỔI BẬT"
              imageUrl={featuredProject.cover_image || '/placeholder.jpg'}
              href={`/projects/${featuredProject.id}`}
              ctaText="Xem chi tiết"
              gradient="bottom"
            />
          </div>
        ) : null}

        {/* Daily Picks - Latest Fabrics */}
        <section className="fade-in" style={{ animationDelay: '100ms' }}>
          <SectionHeader
            overline="HÀNG NGÀY"
            title="Vải mới nhất"
            subtitle="Khám phá những mẫu vải mới được thêm vào thư viện"
            viewAllHref="/fabrics"
          />
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} variant="standard" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestFabrics.map((fabric, index) => (
                <div 
                  key={fabric.id} 
                  className="stagger-item"
                  style={{ animationDelay: `${index * 50}ms` }}
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
        </section>

        {/* Collections - Horizontal Scroll */}
        {collections.length > 0 && (
          <section className="fade-in" style={{ animationDelay: '200ms' }}>
            <ScrollSection
              overline="BỘ SƯU TẬP"
              title="Khám phá bộ sưu tập"
              subtitle="Các bộ sưu tập được tuyển chọn đặc biệt"
              viewAllHref="/collections"
            >
              {collections.map((collection) => (
                <div 
                  key={collection.id}
                  className="flex-shrink-0"
                  style={{ width: '320px' }}
                >
                  <StandardCard
                    title={collection.name}
                    description={collection.description}
                    category="Bộ sưu tập"
                    imageUrl={collection.thumbnail_url || '/placeholder.jpg'}
                    href={`/collections/${collection.id}`}
                    aspectRatio="16/9"
                  />
                </div>
              ))}
            </ScrollSection>
          </section>
        )}

        {/* Projects Grid */}
        {projects.length > 0 && (
          <section className="fade-in" style={{ animationDelay: '300ms' }}>
            <GridSection
              overline="DỰ ÁN"
              title="Công trình tiêu biểu"
              subtitle="Những dự án nổi bật sử dụng vải từ thư viện"
              viewAllHref="/projects"
              columns={3}
            >
              {projects.map((project, index) => (
                <div 
                  key={project.id}
                  className="stagger-item"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <StandardCard
                    title={project.name}
                    description={project.description}
                    category="Dự án"
                    imageUrl={project.cover_image || '/placeholder.jpg'}
                    href={`/projects/${project.id}`}
                    aspectRatio="16/9"
                  />
                </div>
              ))}
            </GridSection>
          </section>
        )}

        {/* Albums - Compact List */}
        {albums.length > 0 && (
          <section className="fade-in" style={{ animationDelay: '400ms' }}>
            <SectionHeader
              overline="ALBUM ẢNH"
              title="Thư viện ảnh"
              subtitle="Bộ sưu tập hình ảnh từ các dự án"
              viewAllHref="/albums"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {albums.map((album, index) => (
                <div 
                  key={album.id}
                  className="stagger-item"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CompactCard
                    title={album.name}
                    subtitle={album.description}
                    imageUrl={album.cover_photo_url || '/placeholder.jpg'}
                    href={`/albums/${album.id}`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && !featuredProject && latestFabrics.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-title3 text-primary mb-2">Chưa có nội dung</h3>
            <p className="text-body-small text-secondary">
              Hãy bắt đầu thêm vải, bộ sưu tập hoặc dự án vào thư viện
            </p>
          </div>
        )}

      </div>
    </main>
  )
}

