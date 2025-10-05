import Image from 'next/image'
import Link from 'next/link'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { Event } from '@/types/database'

interface EventCardProps {
  event: Event
  onClick?: () => void
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const content = (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-macos-border-light group cursor-pointer">
      <div className="aspect-[4/3] relative overflow-hidden bg-ios-gray-50">
        {event.thumbnail_url ? (
          <Image
            src={event.thumbnail_url}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDaysIcon className="w-12 h-12 text-ios-gray-300" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-macos-text-primary truncate">
          {event.name}
        </h3>
        <p className="text-sm text-macos-text-secondary truncate mt-1">
          {event.location || 'Không có địa điểm'}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-macos-border-light">
          <span className="text-xs text-macos-text-secondary">
            {event.event_type || 'Chưa phân loại'}
          </span>
          <span className="text-xs text-macos-text-secondary">
            {new Date(event.event_date).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </div>
  )

  if (onClick) {
    return <div onClick={onClick}>{content}</div>
  }

  return <Link href={`/events/${event.id}`}>{content}</Link>
}

