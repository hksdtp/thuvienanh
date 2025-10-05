'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Project, ProjectFilter, ApiResponse } from '@/types/database'
import Image from 'next/image'
import clsx from 'clsx'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<ProjectFilter>({})
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Fetch projects
  const fetchProjects = async (newFilters?: ProjectFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const currentFilters = newFilters || filters
      
      if (currentFilters.search) params.append('search', currentFilters.search)
      if (currentFilters.project_type) params.append('project_type', currentFilters.project_type)
      if (currentFilters.status) params.append('status', currentFilters.status)
      if (currentFilters.location) params.append('location', currentFilters.location)
      
      const response = await fetch(`/api/projects?${params}`)
      const result: ApiResponse<Project[]> = await response.json()
      
      if (result.success && result.data) {
        setProjects(result.data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, search: searchTerm }
    setFilters(newFilters)
    fetchProjects(newFilters)
  }

  // Handle filter change
  const handleFilterChange = (key: keyof ProjectFilter, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    fetchProjects(newFilters)
    
    // Update active filters display
    if (value) {
      setActiveFilters(prev => [...prev.filter(f => !f.startsWith(key)), `${key}: ${value}`])
    } else {
      setActiveFilters(prev => prev.filter(f => !f.startsWith(key)))
    }
  }

  // Remove filter
  const removeFilter = (filterKey: string) => {
    const key = filterKey.split(':')[0] as keyof ProjectFilter
    const newFilters = { ...filters, [key]: undefined }
    setFilters(newFilters)
    fetchProjects(newFilters)
    setActiveFilters(prev => prev.filter(f => !f.startsWith(key)))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Squares2X2Icon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Thư Viện Ảnh Công Trình</h1>
            </div>

            {/* Settings & User */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Title & Search */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Dự Án & Công Trình</h2>

          <form onSubmit={handleSearch} className="relative w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm dự án..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Filters Row */}
        <div className="flex items-center space-x-3 mb-6">
          {/* Project Type Filter */}
          <select
            value={filters.project_type || ''}
            onChange={(e) => handleFilterChange('project_type', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Loại Dự Án</option>
            <option value="residential">Nhà Ở</option>
            <option value="commercial">Thương Mại</option>
            <option value="office">Văn Phòng</option>
            <option value="retail">Bán Lẻ</option>
            <option value="hospitality">Khách Sạn</option>
            <option value="other">Khác</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Trạng Thái</option>
            <option value="planning">Đang Lên Kế Hoạch</option>
            <option value="in_progress">Đang Thi Công</option>
            <option value="completed">Đã Hoàn Thành</option>
            <option value="archived">Đã Lưu Trữ</option>
          </select>

          {/* Location Filter */}
          <select
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Khu Vực</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP.HCM">TP.HCM</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Nha Trang">Nha Trang</option>
            <option value="Đà Lạt">Đà Lạt</option>
            <option value="Hội An">Hội An</option>
          </select>

          {/* Active Filters */}
          {activeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => removeFilter(filter)}
              className="flex items-center space-x-2 px-3 py-2 bg-cyan-100 text-cyan-700 rounded-lg text-sm font-medium hover:bg-cyan-200 transition-colors"
            >
              <span>{filter.split(': ')[1]}</span>
              <XMarkIcon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy dự án nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                  {project.cover_image_url ? (
                    <Image
                      src={project.cover_image_url}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Squares2X2Icon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">
                    {project.name}
                  </h3>
                  {project.location && (
                    <p className="text-sm text-gray-500 mt-1">{project.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

