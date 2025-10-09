'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Disclosure } from '@headlessui/react'
import {
  Squares2X2Icon,
  MagnifyingGlassIcon,
  PhotoIcon,
  FolderIcon,
  RectangleStackIcon,
  BuildingOffice2Icon,
  HomeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ChevronDownIcon,
  XMarkIcon,
  UserCircleIcon,
  ShoppingCartIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

// Menu structure với groups
const menuStructure = [
  // Top level items (không có group)
  { 
    type: 'item' as const,
    name: 'Tổng quan', 
    href: '/', 
    icon: Squares2X2Icon 
  },
  { 
    type: 'item' as const,
    name: 'Tìm kiếm', 
    href: '/search', 
    icon: MagnifyingGlassIcon 
  },
  
  // GROUP 1: Thư viện Vải
  {
    type: 'group' as const,
    groupName: 'Thư Viện Vải',
    icon: SparklesIcon,
    color: 'blue',
    items: [
      { name: 'Vải Order theo MOQ', href: '/fabrics/moq', icon: ShoppingCartIcon },
      { name: 'Vải Mới', href: '/fabrics/new', icon: PhotoIcon },
      { name: 'Bộ Sưu Tập', href: '/collections', icon: FolderIcon },
      { name: 'Vải Thanh Lý', href: '/fabrics/clearance', icon: TagIcon },
      { name: 'Albums', href: '/albums/fabric', icon: RectangleStackIcon }
    ]
  },
  
  // GROUP 2: Thư viện Công Trình
  {
    type: 'group' as const,
    groupName: 'Thư Viện Công Trình',
    icon: BuildingOffice2Icon,
    color: 'cyan',
    items: [
      { name: 'Nhà Dân', href: '/projects?type=residential', icon: HomeIcon },
      { name: 'Dự Án', href: '/projects?type=commercial', icon: BuildingOfficeIcon },
      { name: 'Albums Ảnh Công Trình', href: '/albums?category=project', icon: RectangleStackIcon }
    ]
  },
  
  // GROUP 3: Sự Kiện
  {
    type: 'group' as const,
    groupName: 'Sự Kiện Công Ty',
    icon: CalendarDaysIcon,
    color: 'purple',
    items: [
      { name: 'Sự Kiện Nội Bộ', href: '/events', icon: SparklesIcon },
      { name: 'Albums Ảnh Sự Kiện', href: '/albums?category=event', icon: RectangleStackIcon }
    ]
  }
]

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function SidebarNew({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href.split('?')[0])
  }

  const getGroupColorClasses = (color: string) => {
    const colors: Record<string, { bg: string, text: string, hover: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100' },
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', hover: 'hover:bg-cyan-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100' }
    }
    return colors[color] || colors.blue
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">TVA Fabric</span>
            </div>
            
            {/* Close button (mobile only) */}
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuStructure.map((item, index) => {
              if (item.type === 'item') {
                // Regular menu item
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                )
              } else {
                // Group with collapsible items
                const GroupIcon = item.icon
                const colorClasses = getGroupColorClasses(item.color)
                const hasActiveItem = item.items.some(subItem => isActive(subItem.href))
                
                return (
                  <Disclosure key={item.groupName} defaultOpen={hasActiveItem}>
                    {({ open: groupOpen }) => (
                      <div className="space-y-1">
                        {/* Group header */}
                        <Disclosure.Button
                          className={clsx(
                            'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                            hasActiveItem
                              ? `${colorClasses.bg} ${colorClasses.text}`
                              : `text-gray-900 ${colorClasses.hover}`
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <GroupIcon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.groupName}</span>
                          </div>
                          <ChevronDownIcon
                            className={clsx(
                              'w-4 h-4 transition-transform',
                              groupOpen ? 'transform rotate-180' : ''
                            )}
                          />
                        </Disclosure.Button>

                        {/* Group items */}
                        <Disclosure.Panel className="space-y-1 pl-4">
                          {item.items.map((subItem) => {
                            const SubIcon = subItem.icon
                            const active = isActive(subItem.href)
                            
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={clsx(
                                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                  active
                                    ? `${colorClasses.bg} ${colorClasses.text}`
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                              >
                                <SubIcon className="w-4 h-4 flex-shrink-0" />
                                <span>{subItem.name}</span>
                              </Link>
                            )
                          })}
                        </Disclosure.Panel>
                      </div>
                    )}
                  </Disclosure>
                )
              }
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <button className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@tva.com</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

