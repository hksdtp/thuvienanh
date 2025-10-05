'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Squares2X2Icon,
  MagnifyingGlassIcon,
  PhotoIcon,
  ChartBarIcon,
  UserCircleIcon,
  XMarkIcon,
  RectangleStackIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Tổng quan', icon: Squares2X2Icon, href: '/', current: true },
  { name: 'Tìm kiếm', icon: MagnifyingGlassIcon, href: '/search', current: false },
  { name: 'Thư viện', icon: PhotoIcon, href: '/fabrics', current: false },
  { name: 'Albums', icon: RectangleStackIcon, href: '/albums', current: false },
  { name: 'Bộ sưu tập', icon: ChartBarIcon, href: '/collections', current: false },
  { name: 'Ảnh Công Trình', icon: BuildingOffice2Icon, href: '/projects', current: false },
  { name: 'Sự Kiện', icon: CalendarDaysIcon, href: '/events', current: false },
]

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Navigation - Icon only */}
      <nav className="flex-1 px-2 py-6 space-y-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600',
                'group flex items-center justify-center p-3 rounded-lg transition-colors'
              )}
              title={item.name}
            >
              <item.icon className="h-6 w-6" />
            </Link>
          )
        })}
      </nav>

      {/* User profile - Icon only */}
      <div className="px-2 py-4 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-orange-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileSidebarContent({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Navigation - Full width with text */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={clsx(
                isActive
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent',
                'group flex items-center px-3 py-3 text-sm font-medium rounded-lg border transition-all duration-200'
              )}
            >
              <item.icon className={clsx(
                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600',
                'mr-3 h-5 w-5 transition-colors'
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User profile - Full width */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-orange-400 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar overlay - only show when isOpen is true */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80 transition-opacity" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <PhotoIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Thư Viện VẢI</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Đóng menu"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <MobileSidebarContent onClose={onClose} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar - always visible on desktop, hidden on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-16 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto border-r border-gray-200 bg-white shadow-sm">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}
