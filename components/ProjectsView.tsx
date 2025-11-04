'use client'

import { useState, useEffect } from 'react'
import StandardCard from './cards/StandardCard'
import CardSkeleton from './cards/CardSkeleton'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface Project {
  id: string
  name: string
  description: string
  cover_image: string
  created_at: string
}

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        const data = await response.json()
        setProjects(data.data || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span className="text-overline text-secondary">CÔNG TRÌNH</span>
          <h1 className="text-display text-primary mt-2 mb-4">Dự án</h1>
          <p className="text-body text-secondary max-w-2xl">
            Khám phá các dự án và công trình tiêu biểu sử dụng vải từ thư viện
          </p>
        </div>

        <div
          className="flex"
          style={{
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-8)'
          }}
        >
          <div className="flex-1 relative">
            <div
              className="absolute inset-y-0 left-0 flex items-center pointer-events-none"
              style={{ paddingLeft: 'var(--space-4)' }}
            >
              <MagnifyingGlassIcon className="h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-body transition-all"
              style={{
                paddingLeft: 'calc(var(--space-4) * 3)',
                paddingRight: 'var(--space-4)',
                paddingTop: 'var(--space-3)',
                paddingBottom: 'var(--space-3)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        {!loading && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <p className="text-body-small text-secondary">
              {filteredProjects.length} dự án
            </p>
          </div>
        )}

        {loading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            style={{ gap: 'var(--space-4)' }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} variant="standard" aspectRatio="16/9" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-title3 text-primary mb-2">Không tìm thấy dự án</h3>
            <p className="text-body-small text-secondary">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            style={{ gap: 'var(--space-4)' }}
          >
            {filteredProjects.map((project, index) => (
              <div 
                key={project.id}
                className="stagger-item"
                style={{ animationDelay: `${index * 30}ms` }}
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
          </div>
        )}

      </div>
    </main>
  )
}

