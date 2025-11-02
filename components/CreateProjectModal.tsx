'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { CreateProjectForm } from '@/types/database'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateProjectForm) => Promise<void>
}

export default function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<CreateProjectForm>({
    name: '',
    description: '',
    type: 'residential',
    location: ''
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'residential',
        location: ''
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-macos-text-primary">Tạo công trình mới</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ios-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-macos-text-secondary" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-macos-text-primary mb-2">
                Tên công trình <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-ios-gray-300 rounded-lg focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
                placeholder="Nhập tên công trình..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-macos-text-primary mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-ios-gray-300 rounded-lg focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all resize-none"
                placeholder="Mô tả công trình..."
              />
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-macos-text-primary mb-2">
                Loại công trình
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-ios-gray-300 rounded-lg focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
              >
                <option value="residential">Nhà ở</option>
                <option value="commercial">Thương mại</option>
                <option value="office">Văn phòng</option>
                <option value="hotel">Khách sạn</option>
                <option value="restaurant">Nhà hàng</option>
                <option value="retail">Bán lẻ</option>
                <option value="hospitality">Khách sạn</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-macos-text-primary mb-2">
                Địa điểm
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-ios-gray-300 rounded-lg focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
                placeholder="Địa điểm công trình..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-macos-border-light">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-macos-text-secondary hover:bg-ios-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="px-6 py-2.5 bg-ios-blue text-white rounded-lg hover:bg-ios-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tạo...' : 'Tạo công trình'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

