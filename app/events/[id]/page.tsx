'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  PhotoIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { Event, ApiResponse } from '@/types/database'
import Image from 'next/image'
import clsx from 'clsx'

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`)
      const result: ApiResponse<Event> = await response.json()
      
      if (result.success && result.data) {
        setEvent(result.data)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('vi-VN', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getEventTypeLabel = (type: string | undefined) => {
    const labels: Record<string, string> = {
      'company_party': 'Tiệc Công Ty',
      'team_building': 'Team Building',
      'training': 'Đào Tạo',
      'conference': 'Hội Nghị',
      'award_ceremony': 'Lễ Trao Giải',
      'anniversary': 'Kỷ Niệm',
      'other': 'Khác'
    }
    return type ? labels[type] || type : ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
        <span className="ml-3 text-macos-text-secondary font-medium">Đang tải...</span>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-macos-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-macos-text-primary mb-2">Không tìm thấy sự kiện</h2>
          <button
            onClick={() => router.push('/events')}
            className="text-ios-blue hover:text-ios-blue-dark font-medium"
          >
            ← Quay lại danh sách sự kiện
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/events')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Quay lại danh sách sự kiện</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10] bg-gray-200">
                {event.cover_image_url ? (
                  <Image
                    src={event.cover_image_url}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                    <SparklesIcon className="w-24 h-24 text-purple-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                {event.status && (
                  <div className={clsx(
                    "absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-semibold shadow-lg",
                    event.status === 'completed' && 'bg-green-500 text-white',
                    event.status === 'upcoming' && 'bg-blue-500 text-white',
                    event.status === 'ongoing' && 'bg-yellow-500 text-white',
                    event.status === 'cancelled' && 'bg-gray-500 text-white'
                  )}>
                    {event.status === 'completed' && 'Đã Hoàn Thành'}
                    {event.status === 'upcoming' && 'Sắp Diễn Ra'}
                    {event.status === 'ongoing' && 'Đang Diễn Ra'}
                    {event.status === 'cancelled' && 'Đã Hủy'}
                  </div>
                )}
              </div>

              {/* Image Gallery Placeholder */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thư Viện Ảnh Sự Kiện</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Chưa có ảnh nào được tải lên
                </p>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {event.name}
              </h1>

              {event.description && (
                <p className="text-gray-600 mb-6">
                  {event.description}
                </p>
              )}

              {/* Details */}
              <div className="space-y-4">
                {/* Event Type */}
                {event.event_type && (
                  <div className="flex items-start space-x-3">
                    <TagIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Loại Sự Kiện</p>
                      <p className="text-gray-900 font-medium">
                        {getEventTypeLabel(event.event_type)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Event Date */}
                {event.event_date && (
                  <div className="flex items-start space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày Diễn Ra</p>
                      <p className="text-gray-900 font-medium">{formatDate(event.event_date)}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {event.location && (
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Địa Điểm</p>
                      <p className="text-gray-900 font-medium">{event.location}</p>
                    </div>
                  </div>
                )}

                {/* Organizer */}
                {event.organizer && (
                  <div className="flex items-start space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Đơn Vị Tổ Chức</p>
                      <p className="text-gray-900 font-medium">{event.organizer}</p>
                    </div>
                  </div>
                )}

                {/* Attendees Count */}
                {event.attendees_count !== undefined && event.attendees_count > 0 && (
                  <div className="flex items-start space-x-3">
                    <UserGroupIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Số Người Tham Gia</p>
                      <p className="text-gray-900 font-medium">{event.attendees_count} người</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Count */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Tổng Số Ảnh</p>
                  <p className="text-2xl font-bold text-gray-900">{event.image_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

