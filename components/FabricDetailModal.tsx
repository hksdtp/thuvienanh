'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon
} from '@heroicons/react/24/outline'
import { Fabric, ApiResponse } from '@/types/database'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface FabricDetailModalProps {
  isOpen: boolean
  onClose: () => void
  fabricId: string
  onDelete?: () => void
  onUpdate?: () => void
}

export default function FabricDetailModal({
  isOpen,
  onClose,
  fabricId,
  onDelete,
  onUpdate
}: FabricDetailModalProps) {
  const [fabric, setFabric] = useState<Fabric | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedFabric, setEditedFabric] = useState<Partial<Fabric>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageScale, setImageScale] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (isOpen && fabricId) {
      fetchFabric()
    }
  }, [isOpen, fabricId])

  const fetchFabric = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fabrics/${fabricId}`)
      const result: ApiResponse<Fabric> = await response.json()

      if (result.success && result.data) {
        setFabric(result.data)
        setEditedFabric(result.data)
      }
    } catch (error) {
      console.error('Error fetching fabric:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      console.log('🔄 Starting save...', { fabricId, editedFabric })
      setSaving(true)

      const response = await fetch(`/api/fabrics/${fabricId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedFabric)
      })

      console.log('📡 Response received:', { status: response.status, ok: response.ok })

      const result: ApiResponse<Fabric> = await response.json()
      console.log('📦 Result parsed:', result)

      if (result.success) {
        console.log('✅ Save successful!')
        setFabric(result.data!)
        setIsEditing(false)
        onUpdate?.()
      } else {
        console.error('❌ Save failed:', result.error)
        alert(result.error || 'Không thể cập nhật vải')
      }
    } catch (error) {
      console.error('❌ Error updating fabric:', error)
      alert('Lỗi khi cập nhật vải')
    } finally {
      console.log('🏁 Save finished, setting saving=false')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa vải này?')) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/fabrics/${fabricId}`, {
        method: 'DELETE'
      })

      const result: ApiResponse<null> = await response.json()

      if (result.success) {
        onDelete?.()
        onClose()
      } else {
        alert(result.error || 'Không thể xóa vải')
      }
    } catch (error) {
      console.error('Error deleting fabric:', error)
      alert('Lỗi khi xóa vải')
    } finally {
      setDeleting(false)
    }
  }

  const handlePreviousImage = () => {
    if (!fabric?.images || fabric.images.length === 0) return
    setCurrentImageIndex((prev) => (prev - 1 + fabric.images!.length) % fabric.images!.length)
    setImageLoaded(false)
    setImageScale(1)
  }

  const handleNextImage = () => {
    if (!fabric?.images || fabric.images.length === 0) return
    setCurrentImageIndex((prev) => (prev + 1) % fabric.images!.length)
    setImageLoaded(false)
    setImageScale(1)
  }

  const handleZoomIn = () => {
    setImageScale((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setImageScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
    setImageLoaded(false)
    setImageScale(1)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return

      switch (e.key) {
        case 'ArrowLeft':
          handlePreviousImage()
          break
        case 'ArrowRight':
          handleNextImage()
          break
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
        case '_':
          handleZoomOut()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isEditing, fabric])

  if (!fabric && !loading) return null

  return (
    <>
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
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0">
            <div className="flex h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full h-full max-w-[95vw] max-h-[95vh] transform bg-white shadow-2xl transition-all flex flex-col lg:flex-row overflow-hidden rounded-2xl">
                  {/* LEFT SIDE - Image Viewer */}
                  <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                      </div>
                    ) : fabric && fabric.images && fabric.images.length > 0 ? (
                      <>
                        {/* Main Image */}
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                          {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                            </div>
                          )}

                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentImageIndex}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="relative w-full h-full flex items-center justify-center"
                              style={{ transform: `scale(${imageScale})`, transition: 'transform 0.2s ease-out' }}
                            >
                              <Image
                                src={fabric.images[currentImageIndex].url}
                                alt={fabric.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
                                className="object-contain"
                                onLoad={() => setImageLoaded(true)}
                                quality={95}
                                priority
                              />
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Navigation Arrows */}
                        {fabric.images.length > 1 && (
                          <>
                            <button
                              onClick={handlePreviousImage}
                              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm z-10"
                              title="Previous (←)"
                            >
                              <ChevronLeftIcon className="w-6 h-6" />
                            </button>
                            <button
                              onClick={handleNextImage}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm z-10"
                              title="Next (→)"
                            >
                              <ChevronRightIcon className="w-6 h-6" />
                            </button>
                          </>
                        )}

                        {/* Image Counter */}
                        {fabric.images.length > 1 && (
                          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium z-10">
                            {currentImageIndex + 1} / {fabric.images.length}
                          </div>
                        )}

                        {/* Zoom Controls */}
                        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 z-10">
                          <button
                            onClick={handleZoomOut}
                            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                            title="Zoom Out (-)"
                            disabled={imageScale <= 0.5}
                          >
                            <MagnifyingGlassMinusIcon className="w-5 h-5" />
                          </button>
                          <span className="text-white text-sm font-medium min-w-[60px] text-center">
                            {Math.round(imageScale * 100)}%
                          </span>
                          <button
                            onClick={handleZoomIn}
                            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                            title="Zoom In (+)"
                            disabled={imageScale >= 3}
                          >
                            <MagnifyingGlassPlusIcon className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Thumbnail Strip */}
                        {fabric.images.length > 1 && (
                          <div className="absolute bottom-4 left-0 right-0 px-4 z-10">
                            <div className="flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-hide">
                              {fabric.images.map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleImageClick(idx)}
                                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                    idx === currentImageIndex
                                      ? 'border-white scale-110'
                                      : 'border-white/30 hover:border-white/60'
                                  }`}
                                >
                                  <Image
                                    src={img.url}
                                    alt={`Thumbnail ${idx + 1}`}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                    quality={60}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white/60">
                        <PhotoIcon className="w-16 h-16 mb-2" />
                        <p>Không có ảnh</p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT SIDE - Information Panel */}
                  <div className="w-full lg:w-[420px] xl:w-[480px] bg-white flex flex-col overflow-hidden border-l border-gray-200">
                    {/* Header */}
                    <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 truncate">
                            {fabric?.name || 'Chi tiết vải'}
                          </h3>
                          {fabric?.code && (
                            <p className="text-sm text-gray-500 font-mono mt-1">{fabric.code}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {!isEditing && (
                            <>
                              <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Xóa"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Đóng"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                      ) : fabric ? (
                        <div className="space-y-6">
                          {/* Mô tả */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Mô tả
                            </label>
                            {isEditing ? (
                              <textarea
                                value={editedFabric.description || ''}
                                onChange={(e) => setEditedFabric({ ...editedFabric, description: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Nhập mô tả..."
                              />
                            ) : (
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {fabric.description || '-'}
                              </p>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="border-t border-gray-200"></div>

                          {/* Specifications Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Chất liệu */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Chất liệu
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedFabric.material || ''}
                                  onChange={(e) => setEditedFabric({ ...editedFabric, material: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Vd: Cotton"
                                />
                              ) : (
                                <p className="text-gray-900 font-medium">{fabric.material || '-'}</p>
                              )}
                            </div>

                            {/* Màu sắc */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Màu sắc
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedFabric.color || ''}
                                  onChange={(e) => setEditedFabric({ ...editedFabric, color: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Vd: Xanh navy"
                                />
                              ) : (
                                <p className="text-gray-900 font-medium">{fabric.color || '-'}</p>
                              )}
                            </div>

                            {/* Độ rộng */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Độ rộng
                              </label>
                              {isEditing ? (
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={editedFabric.width || ''}
                                    onChange={(e) => setEditedFabric({ ...editedFabric, width: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="150"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                                </div>
                              ) : (
                                <p className="text-gray-900 font-medium">{fabric.width ? `${fabric.width} cm` : '-'}</p>
                              )}
                            </div>

                            {/* Giá */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Giá
                              </label>
                              {isEditing ? (
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={editedFabric.price_per_meter || ''}
                                    onChange={(e) => setEditedFabric({ ...editedFabric, price_per_meter: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="50000"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">VNĐ/m</span>
                                </div>
                              ) : (
                                <p className="text-gray-900 font-medium">
                                  {fabric.price_per_meter ? `${fabric.price_per_meter.toLocaleString('vi-VN')} VNĐ/m` : '-'}
                                </p>
                              )}
                            </div>

                            {/* Tồn kho */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Tồn kho
                              </label>
                              {isEditing ? (
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={editedFabric.stock_quantity || ''}
                                    onChange={(e) => setEditedFabric({ ...editedFabric, stock_quantity: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="100"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m</span>
                                </div>
                              ) : (
                                <p className="text-gray-900 font-medium">{fabric.stock_quantity || 0} m</p>
                              )}
                            </div>

                            {/* MOQ */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                MOQ
                              </label>
                              {isEditing ? (
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={editedFabric.min_order_quantity || ''}
                                    onChange={(e) => setEditedFabric({ ...editedFabric, min_order_quantity: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="10"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m</span>
                                </div>
                              ) : (
                                <p className="text-gray-900 font-medium">{fabric.min_order_quantity || 1} m</p>
                              )}
                            </div>
                          </div>

                          {/* Edit Mode Actions */}
                          {isEditing && (
                            <>
                              <div className="border-t border-gray-200"></div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => {
                                    setIsEditing(false)
                                    setEditedFabric(fabric)
                                  }}
                                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                  disabled={saving}
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={handleSave}
                                  disabled={saving}
                                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

