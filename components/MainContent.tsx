'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  SparklesIcon,
  PhotoIcon,
  FolderIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline'

interface Stats {
  totalFabrics: number
  totalCollections: number
  totalProjects: number
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

export default function MainContentNew() {
  const [stats, setStats] = useState<Stats>({
    totalFabrics: 0,
    totalCollections: 0,
    totalProjects: 0
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

        // Get latest 4 fabrics
        const latest = fabricsData.data?.slice(0, 4) || []
        setLatestFabrics(latest)

        // Fetch collections data
        const collectionsRes = await fetch('/api/collections')
        const collectionsData = await collectionsRes.json()
        const totalCollections = collectionsData.data?.length || 0

        // Get featured 4 collections
        const featured = collectionsData.data?.slice(0, 4) || []
        setFeaturedCollections(featured)

        // Fetch projects data
        const projectsRes = await fetch('/api/projects')
        const projectsData = await projectsRes.json()
        const totalProjects = projectsData.data?.length || 0

        setStats({
          totalFabrics,
          totalCollections,
          totalProjects
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const quickLinks = [
    {
      title: 'Thư Viện Vải',
      icon: SparklesIcon,
      href: '/fabrics',
      count: stats.totalFabrics,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Vải mẫu & Bộ sưu tập'
    },
    {
      title: 'Thư Viện Công Trình',
      icon: BuildingOffice2Icon,
      href: '/projects',
      count: stats.totalProjects,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Công trình & Phong cách'
    },
  ]

  return (
    <main className="flex-1 overflow-y-auto bg-macos-bg-secondary">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Welcome Section - Minimal */}
        <div>
          <h1 className="text-3xl font-semibold text-macos-text-primary tracking-tight">
            Chào mừng trở lại
          </h1>
          <p className="mt-2 text-macos-text-secondary">
            Quản lý vải, bộ sưu tập và công trình của bạn
          </p>
        </div>

        {/* Quick Links - Clean Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-white rounded-xl p-8 hover:shadow-lg transition-all duration-200 border border-macos-border-light"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${link.bgColor} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${link.color}`} strokeWidth={1.8} />
                  </div>
                  <p className="text-4xl font-semibold text-macos-text-primary">
                    {link.count}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-macos-text-primary mb-1">
                    {link.title}
                  </h3>
                  <p className="text-sm text-macos-text-secondary">
                    {link.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Access Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Thư Viện Vải */}
          <div className="bg-white rounded-xl p-6 border border-macos-border-light">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <SparklesIcon className="w-5 h-5 text-blue-600" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-semibold text-macos-text-primary">
                  Thư Viện Vải
                </h2>
              </div>
              <Link
                href="/fabrics"
                className="text-sm text-ios-blue hover:text-ios-blue-dark font-medium transition-colors"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="space-y-2">
              <Link
                href="/fabrics"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-ios-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <PhotoIcon className="w-5 h-5 text-macos-text-secondary" strokeWidth={1.8} />
                  <span className="text-sm text-macos-text-primary">Vải Mẫu</span>
                </div>
                <span className="text-xs text-macos-text-secondary group-hover:text-ios-blue transition-colors">
                  {stats.totalFabrics} mẫu
                </span>
              </Link>
              <Link
                href="/collections"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-ios-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FolderIcon className="w-5 h-5 text-macos-text-secondary" strokeWidth={1.8} />
                  <span className="text-sm text-macos-text-primary">Bộ Sưu Tập</span>
                </div>
                <span className="text-xs text-macos-text-secondary group-hover:text-ios-blue transition-colors">
                  {stats.totalCollections} bộ
                </span>
              </Link>
            </div>
          </div>

          {/* Thư Viện Công Trình */}
          <div className="bg-white rounded-xl p-6 border border-macos-border-light">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-lg">
                  <BuildingOffice2Icon className="w-5 h-5 text-green-600" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-semibold text-macos-text-primary">
                  Thư Viện Công Trình
                </h2>
              </div>
              <Link
                href="/projects"
                className="text-sm text-ios-blue hover:text-ios-blue-dark font-medium transition-colors"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="space-y-2">
              <Link
                href="/projects"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-ios-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BuildingOffice2Icon className="w-5 h-5 text-macos-text-secondary" strokeWidth={1.8} />
                  <span className="text-sm text-macos-text-primary">Công Trình</span>
                </div>
                <span className="text-xs text-macos-text-secondary group-hover:text-ios-blue transition-colors">
                  {stats.totalProjects} dự án
                </span>
              </Link>
              <Link
                href="/styles"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-ios-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-5 h-5 text-macos-text-secondary" strokeWidth={1.8} />
                  <span className="text-sm text-macos-text-primary">Phong Cách</span>
                </div>
                <span className="text-xs text-macos-text-secondary group-hover:text-ios-blue transition-colors">
                  Xem →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Latest Fabrics - Minimal Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-macos-text-primary">
              Vải mới nhất
            </h2>
            <Link
              href="/fabrics"
              className="text-sm text-ios-blue hover:text-ios-blue-dark font-medium transition-colors"
            >
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-ios-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-ios-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-ios-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestFabrics.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-macos-border-light">
              <PhotoIcon className="w-12 h-12 text-ios-gray-400 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-macos-text-secondary">Chưa có vải nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestFabrics.map((fabric) => (
                <Link
                  key={fabric.id}
                  href={`/fabrics/${fabric.id}`}
                  className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light"
                >
                  <div className="aspect-square relative overflow-hidden bg-ios-gray-50">
                    {fabric.image_url ? (
                      <Image
                        src={fabric.image_url}
                        alt={fabric.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-ios-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-macos-text-primary truncate">
                      {fabric.name}
                    </h3>
                    <p className="text-sm text-macos-text-secondary truncate mt-1">
                      {fabric.description || 'Không có mô tả'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Featured Collections - Minimal Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-macos-text-primary">
              Bộ sưu tập nổi bật
            </h2>
            <Link 
              href="/collections"
              className="text-sm text-ios-blue hover:text-ios-blue-dark font-medium transition-colors"
            >
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-ios-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-ios-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-ios-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredCollections.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-macos-border-light">
              <FolderIcon className="w-12 h-12 text-ios-gray-400 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-macos-text-secondary">Chưa có bộ sưu tập nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-ios-gray-50">
                    {collection.thumbnail_url ? (
                      <Image
                        src={collection.thumbnail_url}
                        alt={collection.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderIcon className="w-12 h-12 text-ios-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-macos-text-primary truncate">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-macos-text-secondary truncate mt-1">
                      {collection.description || 'Không có mô tả'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}

