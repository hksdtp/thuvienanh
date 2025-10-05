'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { Project, ApiResponse } from '@/types/database'
import Image from 'next/image'

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      const result: ApiResponse<Project> = await response.json()
      
      if (result.success && result.data) {
        setProject(result.data)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
        <span className="ml-3 text-macos-text-secondary font-medium">Đang tải...</span>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy dự án</h2>
          <button
            onClick={() => router.push('/projects')}
            className="text-cyan-600 hover:text-cyan-700"
          >
            ← Quay lại danh sách dự án
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Quay lại danh sách dự án</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10] bg-gray-200">
                {project.cover_image_url ? (
                  <Image
                    src={project.cover_image_url}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <PhotoIcon className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Image Gallery Placeholder */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thư Viện Ảnh Dự Án</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Chưa có ảnh nào được tải lên
                </p>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {project.name}
              </h1>

              {project.description && (
                <p className="text-gray-600 mb-6">
                  {project.description}
                </p>
              )}

              {/* Details */}
              <div className="space-y-4">
                {/* Project Type */}
                {project.project_type && (
                  <div className="flex items-start space-x-3">
                    <TagIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Loại Dự Án</p>
                      <p className="text-gray-900 font-medium capitalize">
                        {project.project_type === 'residential' ? 'Nhà Ở' :
                         project.project_type === 'commercial' ? 'Thương Mại' :
                         project.project_type === 'office' ? 'Văn Phòng' :
                         project.project_type === 'retail' ? 'Bán Lẻ' :
                         project.project_type === 'hospitality' ? 'Khách Sạn' : 'Khác'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {project.location && (
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Địa Điểm</p>
                      <p className="text-gray-900 font-medium">{project.location}</p>
                    </div>
                  </div>
                )}

                {/* Client */}
                {project.client_name && (
                  <div className="flex items-start space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Khách Hàng</p>
                      <p className="text-gray-900 font-medium">{project.client_name}</p>
                    </div>
                  </div>
                )}

                {/* Completion Date */}
                {project.completion_date && (
                  <div className="flex items-start space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày Hoàn Thành</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(project.completion_date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status */}
                {project.status && (
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 mt-0.5 flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full ${
                        project.status === 'completed' ? 'bg-green-500' :
                        project.status === 'in_progress' ? 'bg-blue-500' :
                        project.status === 'planning' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trạng Thái</p>
                      <p className="text-gray-900 font-medium capitalize">
                        {project.status === 'completed' ? 'Đã Hoàn Thành' :
                         project.status === 'in_progress' ? 'Đang Thi Công' :
                         project.status === 'planning' ? 'Đang Lên Kế Hoạch' :
                         project.status === 'archived' ? 'Đã Lưu Trữ' : project.status}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Thẻ Tag</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Count */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Tổng Số Ảnh</p>
                  <p className="text-2xl font-bold text-gray-900">{project.image_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

