'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import ProjectUploadForm from '@/components/ProjectUploadForm'

export default function ProjectUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') // 'nha-dan' or 'du-an'
  const featuredParam = searchParams.get('featured') // 'true' for featured projects

  // Map URL param to project type
  const projectType = typeParam === 'du-an' ? 'du-an' : 'nha-dan'
  const isFeatured = featuredParam === 'true'

  const handleSubmit = async (data: any) => {
    console.log('Submitting project:', data)

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('type', data.type)

    // Add featured flag if applicable
    if (isFeatured) {
      formData.append('is_featured', 'true')
    }

    // Append all images
    data.images.forEach((image: File) => {
      formData.append('images', image)
    })

    try {
      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      console.log('Upload success:', result)

      // Redirect based on project type or featured status
      let redirectPath = '/projects'
      if (isFeatured) {
        redirectPath = '/projects/cong-trinh-tieu-bieu'
      } else if (data.type === 'du-an') {
        redirectPath = '/projects/du-an'
      } else if (data.type === 'nha-dan') {
        redirectPath = '/projects/khach-hang-le'
      }

      router.push(redirectPath)
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Có lỗi xảy ra khi tải lên. Vui lòng thử lại.')
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <ProjectUploadForm
      initialProjectType={projectType}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}

