'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { Collection, Fabric, ApiResponse } from '@/types/database'

import FabricCard from '@/components/FabricCard'

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string
  
  const [collection, setCollection] = useState<Collection | null>(null)
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch collection và fabrics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch collection info
        const collectionResponse = await fetch(`/api/collections/${collectionId}`)
        const collectionResult: ApiResponse<Collection> = await collectionResponse.json()
        
        if (collectionResult.success && collectionResult.data) {
          setCollection(collectionResult.data)
        } else {
          console.error('Error fetching collection:', collectionResult.error)
          router.push('/collections')
          return
        }
        
        // Fetch fabrics in collection
        const fabricsResponse = await fetch(`/api/collections/${collectionId}/fabrics`)
        const fabricsResult: ApiResponse<Fabric[]> = await fabricsResponse.json()
        
        if (fabricsResult.success && fabricsResult.data) {
          setFabrics(fabricsResult.data)
        } else {
          console.error('Error fetching fabrics:', fabricsResult.error)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/collections')
      } finally {
        setLoading(false)
      }
    }
    
    if (collectionId) {
      fetchData()
    }
  }, [collectionId, router])

  // Handle xóa collection
  const handleDeleteCollection = async () => {
    if (!collection) return
    
    if (!confirm(`Bạn có chắc chắn muốn xóa bộ sưu tập "${collection.name}"?`)) return
    
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE'
      })
      
      const result: ApiResponse<null> = await response.json()
      
      if (result.success) {
        router.push('/collections')
      } else {
        alert(result.error || 'Không thể xóa bộ sưu tập')
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      alert('Có lỗi xảy ra khi xóa bộ sưu tập')
    }
  }

  // Handle xóa vải khỏi collection
  const handleRemoveFabric = async (fabricId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vải này khỏi bộ sưu tập?')) return
    
    try {
      const response = await fetch(`/api/collections/${collectionId}/fabrics?fabric_id=${fabricId}`, {
        method: 'DELETE'
      })
      
      const result: ApiResponse<null> = await response.json()
      
      if (result.success) {
        setFabrics(prev => prev.filter(f => f.id !== fabricId))
        // Update collection fabric count
        if (collection) {
          setCollection(prev => prev ? {
            ...prev,
            fabric_count: Math.max(0, prev.fabric_count - 1)
          } : null)
        }
      } else {
        alert(result.error || 'Không thể xóa vải khỏi bộ sưu tập')
      }
    } catch (error) {
      console.error('Error removing fabric:', error)
      alert('Có lỗi xảy ra khi xóa vải')
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
        <span className="ml-3 text-macos-text-secondary font-medium">Đang tải...</span>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-gray-100">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy bộ sưu tập
                </h3>
                <Link
                  href="/collections"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Quay lại danh sách bộ sưu tập
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="p-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link href="/collections" className="hover:text-gray-700">
                Bộ sưu tập
              </Link>
              <span>/</span>
              <span className="text-gray-900">{collection.name}</span>
            </div>

            {/* Collection Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Link
                      href="/collections"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {collection.name}
                    </h1>
                  </div>
                  
                  {collection.description && (
                    <p className="text-gray-600 mb-4">{collection.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>{collection.fabric_count} loại vải</span>
                    <span>Tạo: {formatDate(collection.created_at)}</span>
                    <span>Cập nhật: {formatDate(collection.updated_at)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/collections/${collection.id}/add-fabrics`}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Thêm vải
                  </Link>
                  
                  <Link
                    href={`/collections/${collection.id}/edit`}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  
                  <button
                    onClick={handleDeleteCollection}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Xóa bộ sưu tập"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Fabrics Grid */}
            {fabrics.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có vải nào trong bộ sưu tập
                </h3>
                <p className="text-gray-600 mb-6">
                  Thêm vải vào bộ sưu tập để bắt đầu tổ chức
                </p>
                <Link
                  href={`/collections/${collection.id}/add-fabrics`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Thêm vải
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {fabrics.map((fabric) => (
                  <FabricCard
                    key={fabric.id}
                    fabric={fabric}
                    showRemoveFromCollection
                    onRemoveFromCollection={() => handleRemoveFabric(fabric.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
