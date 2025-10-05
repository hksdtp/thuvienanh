'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  EyeIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  FolderPlusIcon
} from '@heroicons/react/24/outline'

interface Stats {
  totalFabrics: number
  totalCollections: number
  lowStock: number
}

interface Fabric {
  id: string
  name: string
  description: string
  image_url: string
  created_at: string
}

interface Collection {
  id: string
  name: string
  description: string
  thumbnail_url: string
  created_at: string
}

export default function MainContent() {
  const [stats, setStats] = useState<Stats>({
    totalFabrics: 0,
    totalCollections: 0,
    lowStock: 0
  })
  const [latestFabrics, setLatestFabrics] = useState<Fabric[]>([])
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch fabrics data
        const fabricsRes = await fetch('/api/fabrics')
        const fabricsData = await fabricsRes.json()
        const totalFabrics = fabricsData.data?.length || 0

        // Get latest 3 fabrics
        const latest = fabricsData.data?.slice(0, 3) || []
        setLatestFabrics(latest)

        // Fetch collections data
        const collectionsRes = await fetch('/api/collections')
        const collectionsData = await collectionsRes.json()
        const totalCollections = collectionsData.data?.length || 0

        // Get featured 3 collections
        const featured = collectionsData.data?.slice(0, 3) || []
        setFeaturedCollections(featured)

        // Count low stock fabrics (stock < 100)
        const lowStock = fabricsData.data?.filter((f: any) => f.stock_quantity < 100).length || 0

        setStats({
          totalFabrics,
          totalCollections,
          lowStock
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const displayStats = [
    {
      label: 'Tổng số mẫu vải',
      value: loading ? '...' : stats.totalFabrics.toLocaleString('vi-VN'),
      color: 'text-gray-900'
    },
    {
      label: 'Bộ sưu tập',
      value: loading ? '...' : stats.totalCollections.toString(),
      color: 'text-gray-900'
    },
    {
      label: 'Sắp hết hàng',
      value: loading ? '...' : stats.lowStock.toString(),
      color: stats.lowStock > 0 ? 'text-yellow-600' : 'text-gray-900'
    },
  ]

  const quickActions = [
    {
      title: 'Duyệt Vải',
      icon: EyeIcon,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-600',
      href: '/fabrics'
    },
    {
      title: 'Quản lý kho',
      icon: ArchiveBoxIcon,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      iconColor: 'text-gray-600',
      href: '/inventory'
    },
    {
      title: 'Báo cáo',
      icon: ChartBarIcon,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      iconColor: 'text-gray-600',
      href: '/reports'
    },
    {
      title: 'Tạo BST',
      icon: FolderPlusIcon,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      iconColor: 'text-gray-600',
      href: '/collections'
    },
  ]

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Section - Tổng quan */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Tổng quan</h2>
              <div className="space-y-3">
                {displayStats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{stat.label}</span>
                    <span className={`font-bold text-2xl ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions - Truy cập nhanh */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Truy cập nhanh</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon
                  return (
                    <Link
                      key={index}
                      href={action.href}
                      className={`${action.bgColor} rounded-lg p-4 hover:shadow-md transition-all duration-200 block`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <IconComponent className={`w-6 h-6 ${action.iconColor}`} />
                        <h3 className={`font-medium text-xs ${action.textColor}`}>{action.title}</h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vải mới về */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Vải mới về</h2>
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm">Đang tải...</p>
                </div>
              ) : latestFabrics.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">Chưa có vải nào</p>
                  <p className="text-xs mt-2">Bắt đầu bằng cách thêm vải mới</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {latestFabrics.map((fabric) => (
                    <Link
                      key={fabric.id}
                      href={`/fabrics/${fabric.id}`}
                      className="group block"
                    >
                      <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        {/* Image */}
                        <div className="relative aspect-[4/3] bg-gray-100">
                          {fabric.image_url ? (
                            <Image
                              src={fabric.image_url}
                              alt={fabric.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Content */}
                        <div className="p-3">
                          <h3 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {fabric.name}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {fabric.description || 'Chưa có mô tả'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Bộ sưu tập nổi bật */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Bộ sưu tập nổi bật</h2>
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm">Đang tải...</p>
                </div>
              ) : featuredCollections.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">Chưa có bộ sưu tập nào</p>
                  <p className="text-xs mt-2">Bắt đầu bằng cách tạo bộ sưu tập mới</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuredCollections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collections/${collection.id}`}
                      className="group block"
                    >
                      <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        {/* Image */}
                        <div className="relative aspect-[4/3] bg-gray-100">
                          {collection.thumbnail_url ? (
                            <Image
                              src={collection.thumbnail_url}
                              alt={collection.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Content */}
                        <div className="p-3">
                          <h3 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {collection.name}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {collection.description || 'Chưa có mô tả'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
