'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  XMarkIcon, 
  MagnifyingGlassPlusIcon,
  InformationCircleIcon,
  ShareIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Fabric, ApiResponse } from '@/types/database'

interface FabricDetailPageProps {
  params: {
    id: string
  }
}

export default function FabricDetailPage({ params }: FabricDetailPageProps) {
  const router = useRouter()
  const [fabric, setFabric] = useState<Fabric | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const fetchFabric = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/fabrics/${params.id}`)
        const result: ApiResponse<Fabric> = await response.json()
        
        if (result.success && result.data) {
          setFabric(result.data)
        } else {
          console.error('Failed to fetch fabric:', result.error)
        }
      } catch (error) {
        console.error('Error fetching fabric:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFabric()
  }, [params.id])

  const handleClose = () => {
    router.back()
  }

  const handleAddToCollection = () => {
    // TODO: Implement add to collection
    alert('Chức năng thêm vào bộ sưu tập đang được phát triển')
  }

  const handleShare = () => {
    // TODO: Implement share
    if (navigator.share) {
      navigator.share({
        title: fabric?.name,
        text: fabric?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Đã copy link vào clipboard')
    }
  }

  const handleDownload = () => {
    // TODO: Implement download
    if (fabric?.primary_image_url) {
      window.open(fabric.primary_image_url, '_blank')
    }
  }

  const getStockStatus = () => {
    if (!fabric) return { text: '', color: '', available: false }
    
    if (fabric.stock_quantity > fabric.min_order_quantity * 2) {
      return {
        text: `Còn hàng (${fabric.stock_quantity}m)`,
        color: 'text-green-600',
        available: true
      }
    } else if (fabric.stock_quantity > 0) {
      return {
        text: `Sắp hết (${fabric.stock_quantity}m)`,
        color: 'text-yellow-600',
        available: true
      }
    } else {
      return {
        text: 'Hết hàng',
        color: 'text-red-600',
        available: false
      }
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
      </div>
    )
  }

  if (!fabric) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-semibold mb-4">Không tìm thấy vải</h2>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  const stockStatus = getStockStatus()
  const images = fabric.primary_image_url ? [fabric.primary_image_url] : []

  return (
    <div className="fixed inset-0 bg-black flex">
      {/* Left side - Image viewer */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-80 z-10 flex items-center justify-between p-4">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Title */}
          <div className="flex-1 mx-4 text-white">
            <h1 className="text-lg font-semibold">{fabric.name}</h1>
            <p className="text-sm text-gray-300">{fabric.code}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors">
              <MagnifyingGlassPlusIcon className="h-5 w-5" />
            </button>
            <button className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors">
              <InformationCircleIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main image */}
        <div className="flex-1 flex items-center justify-center p-20">
          <div className="relative w-full h-full max-w-2xl max-h-[600px]">
            {images.length > 0 && !imageError ? (
              <Image
                src={images[selectedImageIndex]}
                alt={fabric.name}
                fill
                className="object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-lg">Không có ảnh</span>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImageIndex === index
                    ? 'border-cyan-500'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
              >
                <Image
                  src={img}
                  alt={`${fabric.name} ${index + 1}`}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right sidebar - Details */}
      <div className="w-80 bg-white flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add to collection button */}
          <button
            onClick={handleAddToCollection}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Thêm vào bộ sưu tập</span>
          </button>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Mô tả</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {fabric.description || 'Chưa có mô tả'}
            </p>
          </div>

          {/* Technical specs */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông số kỹ thuật</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Chất liệu</span>
                <span className="text-gray-900 font-medium">{fabric.material}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Khổ vải</span>
                <span className="text-gray-900">{fabric.width} cm</span>
              </div>
              {fabric.weight && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trọng lượng</span>
                  <span className="text-gray-900">{fabric.weight} g/m²</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Màu sắc</span>
                <span className="text-gray-900">{fabric.color}</span>
              </div>
              {fabric.finish && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hoàn thiện</span>
                  <span className="text-gray-900">{fabric.finish}</span>
                </div>
              )}
              {fabric.origin && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Xuất xứ</span>
                  <span className="text-gray-900">{fabric.origin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price & Stock */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Giá & Tình trạng kho</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giá / mét</span>
                <span className="text-gray-900 font-semibold">${fabric.price_per_meter.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600">Tồn kho</span>
                <span className={`font-medium flex items-center ${stockStatus.color}`}>
                  {stockStatus.available && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                  {stockStatus.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <button
            onClick={handleAddToCollection}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Thêm vào bộ sưu tập</span>
          </button>
          
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
          >
            <ShareIcon className="h-5 w-5" />
            <span>Chia sẻ</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Tải xuống ảnh</span>
          </button>
        </div>
      </div>
    </div>
  )
}

