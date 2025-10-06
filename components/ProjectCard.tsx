import Image from 'next/image'
import Link from 'next/link'
import { BuildingOffice2Icon } from '@heroicons/react/24/outline'
import { Project } from '@/types/database'

interface ProjectCardProps {
  project: Project
  onClick?: () => void
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const content = (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light group cursor-pointer">
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

