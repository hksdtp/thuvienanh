'use client'

import { useState } from 'react'
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

// Mock data for demo
const mockFabric = {
  id: 'demo-1',
  name: 'Vải Lụa Cotton - F0123',
  code: 'F0123',
  description: 'Vải sự pha trộn sang trọng giữa lụa và các sợi cotton nhẹ nhàng, mang lại cảm giác mềm mại và thoáng mát. Lý tưởng cho các thiết kế thời trang cao cấp và trang sức nội thất.',
  material: '70% Lụa, 30% Cotton',
  width: 140,
  weight: 120,
  color: 'Trắng ngà',
  pattern: 'Trơn',
  finish: 'Satin',
  origin: 'Ý',
  price_per_meter: 45.00,
  stock_quantity: 500,
  min_order_quantity: 5,
  primary_image_url: 'https://placehold.co/800x800/f5e6d3/8b7355?text=Vai+Lua+Cotton',
  tags: ['cao cấp', 'mềm mại', 'sang trọng'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true
}

export default function FabricDemoPage() {
  const router = useRouter()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const handleClose = () => {
    router.push('/fabrics')
  }

  const handleAddToCollection = () => {
    alert('Chức năng thêm vào bộ sưu tập đang được phát triển')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockFabric.name,
        text: mockFabric.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Đã copy link vào clipboard')
    }
  }

  const handleDownload = () => {
    if (mockFabric.primary_image_url) {
      window.open(mockFabric.primary_image_url, '_blank')
    }
  }

  const getStockStatus = () => {
    if (mockFabric.stock_quantity > mockFabric.min_order_quantity * 2) {
      return {
        text: `Còn hàng (${mockFabric.stock_quantity}m)`,
        color: 'text-green-600',
        available: true
      }
    } else if (mockFabric.stock_quantity > 0) {
      return {
        text: `Sắp hết (${mockFabric.stock_quantity}m)`,
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

  const stockStatus = getStockStatus()
  const images = mockFabric.primary_image_url ? [mockFabric.primary_image_url] : []

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
            <h1 className="text-lg font-semibold">{mockFabric.name}</h1>
            <p className="text-sm text-gray-300">{mockFabric.code}</p>
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
                alt={mockFabric.name}
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
                  alt={`${mockFabric.name} ${index + 1}`}
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
              {mockFabric.description}
            </p>
          </div>

          {/* Technical specs */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông số kỹ thuật</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Chất liệu</span>
                <span className="text-gray-900 font-medium">{mockFabric.material}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Khổ vải</span>
                <span className="text-gray-900">{mockFabric.width} cm</span>
              </div>
              {mockFabric.weight && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trọng lượng</span>
                  <span className="text-gray-900">{mockFabric.weight} g/m²</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Màu sắc</span>
                <span className="text-gray-900">{mockFabric.color}</span>
              </div>
              {mockFabric.finish && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hoàn thiện</span>
                  <span className="text-gray-900">{mockFabric.finish}</span>
                </div>
              )}
              {mockFabric.origin && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Xuất xứ</span>
                  <span className="text-gray-900">{mockFabric.origin}</span>
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
                <span className="text-gray-900 font-semibold">${mockFabric.price_per_meter.toFixed(2)}</span>
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

