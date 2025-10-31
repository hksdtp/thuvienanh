'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BuildingOffice2Icon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Project, ApiResponse } from '@/types/database'
import PageHeader from '@/components/PageHeader'
import EditProjectModal from '@/components/EditProjectModal'
import Image from 'next/image'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/projects')
      const result: ApiResponse<Project[]> = await response.json()
      if (result.success && result.data) {
        setProjects(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedProject(project)
    setEditModalOpen(true)
  }

  const handleUpdateProject = async (data: { name: string; description?: string; project_type?: string; location?: string; client_name?: string; status?: string; tags?: string[] }) => {
    if (!selectedProject) return

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        await fetchProjects()
        setEditModalOpen(false)
        setSelectedProject(null)
      } else {
        throw new Error(result.error || 'Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  }

  const handleDeleteProject = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()

    const confirmed = confirm(`Bạn có chắc muốn xóa công trình "${project.name}"?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setTimeout(() => {
          fetchProjects()
        }, 500)
      } else {
        throw new Error(result.error || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Có lỗi xảy ra khi xóa công trình')
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || project.project_type === filterType
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title="Công Trình"
        subtitle={`${projects.length} công trình`}
        icon={<BuildingOffice2Icon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <button
            onClick={() => router.push('/projects/upload')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md"
          >
            <PlusIcon className="w-5 h-5" strokeWidth={2} />
            <span>Thêm công trình</span>
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
              placeholder="Tìm kiếm công trình..."
              className="block w-full pl-10 pr-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white text-macos-text-primary focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            >
              <option value="all">Tất cả loại</option>
              <option value="residential">Nhà ở</option>
              <option value="commercial">Thương mại</option>
              <option value="office">Văn phòng</option>
              <option value="hotel">Khách sạn</option>
              <option value="restaurant">Nhà hàng</option>
              <option value="retail">Bán lẻ</option>
              <option value="hospitality">Khách sạn</option>
              <option value="other">Khác</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white text-macos-text-primary focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="planning">Đang lên kế hoạch</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="on_hold">Tạm dừng</option>
              <option value="archived">Lưu trữ</option>
            </select>

            {(filterType !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setFilterType('all')
                  setFilterStatus('all')
                }}
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
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
            <BuildingOffice2Icon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
              Chưa có công trình nào
            </h3>
            <p className="text-sm text-macos-text-secondary">
              Bắt đầu bằng cách thêm công trình mới
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-slideUp cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light group">
                  <div className="aspect-[4/3] relative overflow-hidden bg-ios-gray-50">
                    {project.cover_image_url ? (
                      <Image
                        src={project.cover_image_url}
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BuildingOffice2Icon className="w-12 h-12 text-ios-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditProject(project, e)}
                        className="p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="w-4 h-4 text-ios-blue" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(project, e)}
                        className="p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all"
                        title="Xóa"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-macos-text-primary truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-macos-text-secondary truncate mt-1">
                      {project.location || 'Không có địa điểm'}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-macos-border-light">
                      <span className="text-xs text-macos-text-secondary">
                        {project.image_count || 0} ảnh
                      </span>
                      <span className="text-xs text-macos-text-secondary">
                        {new Date(project.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedProject(null)
        }}
        onSubmit={handleUpdateProject}
        project={selectedProject}
      />
    </div>
  )
}

