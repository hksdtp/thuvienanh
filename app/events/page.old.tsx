'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  CalendarDaysIcon,
  UserGroupIcon,
  MapPinIcon,
  XMarkIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { Event, EventFilter, ApiResponse } from '@/types/database'
import Image from 'next/image'
import clsx from 'clsx'

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<EventFilter>({})
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Fetch events
  const fetchEvents = async (newFilters?: EventFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const currentFilters = newFilters || filters
      
      if (currentFilters.search) params.append('search', currentFilters.search)
      if (currentFilters.event_type) params.append('event_type', currentFilters.event_type)
      if (currentFilters.status) params.append('status', currentFilters.status)
      if (currentFilters.organizer) params.append('organizer', currentFilters.organizer)
      
      const response = await fetch(`/api/events?${params}`)
      const result: ApiResponse<Event[]> = await response.json()
      
      if (result.success && result.data) {
        setEvents(result.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, search: searchTerm }
    setFilters(newFilters)
    fetchEvents(newFilters)
  }

  // Handle filter change
  const handleFilterChange = (key: keyof EventFilter, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    fetchEvents(newFilters)
    
    // Update active filters display
    if (value) {
      setActiveFilters(prev => [...prev.filter(f => !f.startsWith(key)), `${key}: ${value}`])
    } else {
      setActiveFilters(prev => prev.filter(f => !f.startsWith(key)))
    }
  }

  // Remove filter
  const removeFilter = (filterKey: string) => {
    const key = filterKey.split(':')[0] as keyof EventFilter
    const newFilters = { ...filters, [key]: undefined }
    setFilters(newFilters)
    fetchEvents(newFilters)
    setActiveFilters(prev => prev.filter(f => !f.startsWith(key)))
  }

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Thư Viện Ảnh Sự Kiện</h1>
            </div>

            {/* Settings & User */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Title & Search */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Sự Kiện Công Ty</h2>

          <form onSubmit={handleSearch} className="relative w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sự kiện..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Filters Row */}
        <div className="flex items-center space-x-3 mb-6">
          {/* Event Type Filter */}
          <select
            value={filters.event_type || ''}
            onChange={(e) => handleFilterChange('event_type', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Loại Sự Kiện</option>
            <option value="company_party">Tiệc Công Ty</option>
            <option value="team_building">Team Building</option>
            <option value="training">Đào Tạo</option>
            <option value="conference">Hội Nghị</option>
            <option value="award_ceremony">Lễ Trao Giải</option>
            <option value="anniversary">Kỷ Niệm</option>
            <option value="other">Khác</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Trạng Thái</option>
            <option value="upcoming">Sắp Diễn Ra</option>
            <option value="ongoing">Đang Diễn Ra</option>
            <option value="completed">Đã Hoàn Thành</option>
            <option value="cancelled">Đã Hủy</option>
          </select>

          {/* Organizer Filter */}
          <select
            value={filters.organizer || ''}
            onChange={(e) => handleFilterChange('organizer', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Đơn Vị Tổ Chức</option>
            <option value="Phòng Hành Chính">Phòng Hành Chính</option>
            <option value="Phòng Nhân Sự">Phòng Nhân Sự</option>
            <option value="Phòng Marketing">Phòng Marketing</option>
            <option value="Ban Giám Đốc">Ban Giám Đốc</option>
            <option value="Phòng IT">Phòng IT</option>
          </select>

          {/* Active Filters */}
          {activeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => removeFilter(filter)}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              <span>{filter.split(': ')[1]}</span>
              <XMarkIcon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy sự kiện nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => router.push(`/events/${event.id}`)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                  {event.cover_image_url ? (
                    <Image
                      src={event.cover_image_url}
                      alt={event.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                      <SparklesIcon className="w-16 h-16 text-purple-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {event.status && (
                    <div className={clsx(
                      "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold",
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

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                    {event.name}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    {event.event_date && (
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    
                    {event.attendees_count !== undefined && event.attendees_count > 0 && (
                      <div className="flex items-center space-x-2">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{event.attendees_count} người tham gia</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

