'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Album } from '@/types/database'

interface EditAlbumModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description?: string; tags?: string[] }) => Promise<void>
  album: Album | null
}

export default function EditAlbumModal({ isOpen, onClose, onSubmit, album }: EditAlbumModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[]
  })
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load album data when modal opens
  useEffect(() => {
    if (album && isOpen) {
      setFormData({
        name: album.name || '',
        description: album.description || '',
        tags: album.tags || []
      })
      setTagInput('')
    }
  }, [album, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      })
      onClose()
    } catch (error) {
      console.error('Error updating album:', error)
      alert('Có lỗi xảy ra khi cập nhật album')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-macos-border-light px-6 py-4">
                  <Dialog.Title className="text-lg font-semibold text-macos-text-primary">
                    Chỉnh sửa Album
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1 text-macos-text-secondary hover:bg-macos-bg-secondary transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Album Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-macos-text-primary mb-2">
                      Tên Album <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-macos-border-light bg-white text-macos-text-primary placeholder-macos-text-tertiary focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all"
                      placeholder="Nhập tên album..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-macos-text-primary mb-2">
                      Mô tả
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-macos-border-light bg-white text-macos-text-primary placeholder-macos-text-tertiary focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all resize-none"
                      placeholder="Nhập mô tả album..."
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-macos-text-primary mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-macos-border-light bg-white text-macos-text-primary placeholder-macos-text-tertiary focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all"
                        placeholder="Nhập tag và nhấn Enter..."
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2.5 rounded-lg bg-macos-bg-secondary text-macos-text-primary hover:bg-macos-bg-tertiary transition-colors font-medium"
                        disabled={isSubmitting}
                      >
                        Thêm
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ios-blue/10 text-ios-blue text-sm font-medium"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:bg-ios-blue/20 rounded-full p-0.5 transition-colors"
                              disabled={isSubmitting}
                            >
                              <XMarkIcon className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-macos-border-light text-macos-text-primary hover:bg-macos-bg-secondary transition-colors font-medium"
                      disabled={isSubmitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 rounded-lg bg-ios-blue text-white hover:bg-ios-blue/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting || !formData.name.trim()}
                    >
                      {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

