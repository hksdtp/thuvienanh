'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BuildingOffice2Icon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Project } from '@/types/database'

interface ProjectCardProps {
  project: Project
  onClick?: () => void
  onEdit?: (project: Project, e: React.MouseEvent) => void
  onDelete?: (project: Project, e: React.MouseEvent) => void
}

export default function ProjectCard({ project, onClick, onEdit, onDelete }: ProjectCardProps) {
  const content = (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light group cursor-pointer">
      <div className="aspect-[4/3] relative overflow-hidden bg-ios-gray-50">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BuildingOffice2Icon className="w-12 h-12 text-ios-gray-300" strokeWidth={1.5} />
          </div>
        )}

        {/* Action buttons - Show when onEdit or onDelete is provided */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => onEdit(project, e)}
                className="p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all"
                title="Chỉnh sửa"
              >
                <PencilIcon className="w-4 h-4 text-ios-blue" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => onDelete(project, e)}
                className="p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all"
                title="Xóa"
              >
                <TrashIcon className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        )}
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
            {project.project_type || 'Chưa phân loại'}
          </span>
          <span className="text-xs text-macos-text-secondary">
            {new Date(project.created_at).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </div>
  )

  if (onClick) {
    return <div onClick={onClick}>{content}</div>
  }

  return <Link href={`/projects/${project.id}`}>{content}</Link>
}

