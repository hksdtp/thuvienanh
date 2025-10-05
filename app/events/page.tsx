'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDaysIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Event, ApiResponse } from '@/types/database'
import PageHeader from '@/components/PageHeader'
import EventCard from '@/components/EventCard'

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/events')
      const result: ApiResponse<Event[]> = await response.json()
      if (result.success && result.data) {
        setEvents(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || event.event_type === filterType
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="min-h-screen bg-macos-bg-secondary">
      <PageHeader
        title="Sự Kiện"
        subtitle={`${events.length} sự kiện`}
        icon={<CalendarDaysIcon className="w-8 h-8 text-ios-blue" strokeWidth={1.8} />}
        actions={
          <button className="inline-flex items-center space-x-2 px-4 py-2.5 bg-ios-blue text-white text-sm font-medium rounded-lg hover:bg-ios-blue-dark transition-all hover:shadow-md">
            <PlusIcon className="w-5 h-5" strokeWidth={2} />
            <span>Tạo sự kiện</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 space-y-4">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-ios-gray-500" strokeWidth={2} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sự kiện..."
              className="block w-full pl-10 pr-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white text-macos-text-primary focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            >
              <option value="all">Tất cả loại</option>
              <option value="company_party">Tiệc Công Ty</option>
              <option value="team_building">Team Building</option>
              <option value="training">Đào Tạo</option>
              <option value="conference">Hội Nghị</option>
              <option value="award_ceremony">Lễ Trao Giải</option>
              <option value="anniversary">Kỷ Niệm</option>
              <option value="other">Khác</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-ios-gray-300 rounded-lg text-sm bg-white text-macos-text-primary focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            {(filterType !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setFilterType('all')
                  setFilterStatus('all')
                }}
                className="px-4 py-2.5 text-sm text-ios-blue hover:text-ios-blue-dark font-medium transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-ios-blue border-t-transparent"></div>
            <span className="ml-3 text-macos-text-secondary font-medium">Đang tải...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-macos-border-light p-16 text-center">
            <CalendarDaysIcon className="w-16 h-16 text-ios-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-macos-text-primary mb-2">
              Chưa có sự kiện nào
            </h3>
            <p className="text-sm text-macos-text-secondary">
              Bắt đầu bằng cách tạo sự kiện mới
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

