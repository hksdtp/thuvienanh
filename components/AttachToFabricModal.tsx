'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline'
import { Fabric, ApiResponse } from '@/types/database'
import Image from 'next/image'

interface AttachToFabricModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageName: string
  onSuccess?: () => void
}

export default function AttachToFabricModal({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  onSuccess
}: AttachToFabricModalProps) {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null)
  const [attaching, setAttaching] = useState(false)

  // Fetch fabrics
  useEffect(() => {
    if (isOpen) {
      fetchFabrics()
    }
  }, [isOpen])

  const fetchFabrics = async (search?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const response = await fetch(`/api/fabrics?${params}`)
      const result: ApiResponse<Fabric[]> = await response.json()
      
      if (result.success && result.data) {
        setFabrics(result.data)
      }
    } catch (error) {
      console.error('Error fetching fabrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFabrics(searchTerm)
  }

  const handleAttach = async () => {
    if (!selectedFabric) return
    
    setAttaching(true)
    try {
      const response = await fetch(`/api/fabrics/${selectedFabric.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: imageUrl,
          alt_text: imageName,
          is_primary: false,
          sort_order: 0
        })
      })
      
      const result: ApiResponse<any> = await response.json()
      
      if (result.success) {
        alert('Đã gắn ảnh vào vải thành công!')
        onSuccess?.()
        onClose()
      } else {
        alert(`Lỗi: ${result.error}`)
      }
    } catch (error) {
      console.error('Error attaching image:', error)
      alert('Có lỗi xảy ra khi gắn ảnh')
    } finally {
      setAttaching(false)
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Gắn ảnh vào vải
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                  {/* Image preview */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Ảnh được chọn:</p>
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={imageUrl}
                        alt={imageName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{imageName}</p>
                  </div>

                  {/* Search */}
                  <form onSubmit={handleSearch} className="mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm vải..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </form>

                  {/* Fabrics list */}
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Đang tải...</span>
                      </div>
                    ) : fabrics.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        Không tìm thấy vải nào
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {fabrics.map((fabric) => (
                          <button
                            key={fabric.id}
                            onClick={() => setSelectedFabric(fabric)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                              selectedFabric?.id === fabric.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedFabric?.id === fabric.id
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedFabric?.id === fabric.id && (
                                <CheckIcon className="h-3 w-3 text-white" />
                              )}
                            </div>

                            {/* Fabric info */}
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium text-gray-900">
                                {fabric.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {fabric.code} • {fabric.material} • {fabric.color}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAttach}
                    disabled={!selectedFabric || attaching}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {attaching ? 'Đang gắn...' : 'Gắn vào vải'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

