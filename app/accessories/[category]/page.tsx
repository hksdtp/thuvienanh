'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SparklesIcon, TagIcon, ArchiveBoxIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import PageHeader from '@/components/PageHeader'
import Image from 'next/image'
import { t } from '@/lib/translations'

const VALID_CATEGORIES = {
  'phu-kien-trang-tri': {
    title: 'Phụ kiện trang trí',
    subtitle: 'Mành rèm, dây buộc, móc cài, đường bo, viền trang trí',
    icon: SparklesIcon,
    dbValue: 'phu-kien-trang-tri'
  },
  'thanh-phu-kien': {
    title: 'Thanh phụ kiện',
    subtitle: 'Thanh treo rèm và phụ kiện liên quan',
    icon: TagIcon,
    dbValue: 'thanh-phu-kien'
  },
  'thanh-ly': {
    title: 'Thanh lý',
    subtitle: 'Sản phẩm thanh lý, giảm giá',
    icon: ArchiveBoxIcon,
    dbValue: 'thanh-ly'
  }
} as const

type CategorySlug = keyof typeof VALID_CATEGORIES

interface Accessory {
  id: string
  name: string
  code: string
  category: string
  description?: string
  price: number
  stock_quantity: number
  image_url?: string
  created_at: string
}

interface PageProps {
  params: {
    category: string
  }
}

export default function AccessoriesCategoryPage({ params }: PageProps) {
  const router = useRouter()
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  const categoryInfo = VALID_CATEGORIES[params.category as CategorySlug]

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (categoryInfo) {
      fetchAccessories()
    }
  }, [params.category])

  const fetchAccessories = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/accessories/${params.category}`)
      const result = await response.json()
      if (result.success && result.data) {
        setAccessories(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-macos-text-primary mb-2">Không tìm thấy danh mục</h2>
          <p className="text-sm text-macos-text-secondary mb-4">Danh mục "{params.category}" không tồn tại</p>
          <button
            onClick={() => router.push('/')}
            className="text-ios-blue hover:text-ios-blue-dark font-medium"
          >
            ← Về trang chủ
          </button>
        </div>
      </div>
    )
  }

  const Icon = categoryInfo.icon

  const filteredAccessories = accessories.filter(accessory =>
    accessory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accessory.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title={categoryInfo.title}
        subtitle={`${accessories.length} ${t('accessories.items') || 'sản phẩm'}`}
        icon={<Icon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <motion.button whileTap={{ scale: 0.95 }} className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md">
            <PlusIcon className="w-5 h-5" strokeWidth={2} />
            <span>{t('common.add') || 'Thêm mới'}</span>
          </motion.button>
        }
      />

      <div className="px-4 lg:px-8 py-6 lg:py-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-ios-gray-500" strokeWidth={2} />
            </div>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('placeholders.searchAccessories') || 'Tìm kiếm phụ kiện...'} className="block w-full pl-10 pr-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all" />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent" />
            <span className="mt-3 text-gray-600 font-medium">{t('common.loading') || 'Đang tải...'}</span>
          </div>
        ) : filteredAccessories.length === 0 ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl border border-macos-border-light p-12 lg:p-16 text-center">
            <Icon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-macos-text-primary mb-2">{t('messages.noData') || 'Chưa có dữ liệu'}</h3>
            <p className="text-sm text-macos-text-secondary">{searchTerm ? (t('messages.noSearchResults') || 'Không tìm thấy kết quả') : `Bắt đầu bằng cách thêm ${categoryInfo.title.toLowerCase()} mới`}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {filteredAccessories.map((accessory, index) => (
              <motion.div key={accessory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }} className="cursor-pointer">
                <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light group">
                  <div className="aspect-[3/4] relative overflow-hidden bg-ios-gray-50">
                    {accessory.image_url ? (
                      <Image
                        src={accessory.image_url}
                        alt={accessory.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-12 h-12 text-ios-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-macos-text-primary truncate">
                      {accessory.name}
                    </h3>
                    <p className="text-sm text-macos-text-secondary truncate mt-1">
                      {accessory.code}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-macos-border-light">
                      <span className="text-sm font-medium text-ios-blue">
                        {accessory.price?.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-xs text-macos-text-secondary">
                        SL: {accessory.stock_quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}