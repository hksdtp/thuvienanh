'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Disclosure, Transition, Dialog } from '@headlessui/react'
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
  ChevronRightIcon,
  XMarkIcon,
  WrenchScrewdriverIcon,
  TagIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  StarIcon,
  PaintBrushIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

// Menu structure
const menuStructure = [
  // Top level items
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
    items: [
      { name: 'Vải Order theo MOQ', href: '/fabrics/moq', icon: ShoppingCartIcon },
      { name: 'Vải Mới', href: '/fabrics/new', icon: PhotoIcon },
      { name: 'Bộ Sưu Tập', href: '/collections', icon: FolderIcon },
      { name: 'Vải Thanh Lý', href: '/fabrics/clearance', icon: TagIcon },
      { name: 'Albums', href: '/albums/fabric', icon: RectangleStackIcon }
    ]
  },

  // GROUP 2: Phụ kiện (MỚI)
  {
    type: 'group' as const,
    groupName: 'Phụ Kiện',
    icon: WrenchScrewdriverIcon,
    items: [
      { name: 'Phụ kiện trang trí', href: '/accessories/phu-kien-trang-tri', icon: SparklesIcon },
      { name: 'Thanh phụ kiện', href: '/accessories/thanh-phu-kien', icon: TagIcon },
      { name: 'Thanh lý', href: '/accessories/thanh-ly', icon: ArchiveBoxIcon },
      { name: 'Albums Phụ kiện', href: '/albums/accessory', icon: RectangleStackIcon }
    ]
  },

  // GROUP 3: Thư viện Công Trình (CẬP NHẬT)
  {
    type: 'group' as const,
    groupName: 'Thư Viện Công Trình',
    icon: BuildingOffice2Icon,
    items: [
      { name: 'Khách hàng lẻ', href: '/projects/khach-hang-le', icon: UserGroupIcon },
      { name: 'Dự án', href: '/projects/du-an', icon: BuildingOfficeIcon },
      { name: 'Công trình tiêu biểu', href: '/projects/cong-trinh-tieu-bieu', icon: StarIcon },
      { name: 'Phong cách', href: '/styles', icon: PaintBrushIcon }
    ]
  },

  // GROUP 4: Sự Kiện
  {
    type: 'group' as const,
    groupName: 'Sự Kiện Công Ty',
    icon: CalendarDaysIcon,
    items: [
      { name: 'Sự Kiện Nội Bộ', href: '/events', icon: SparklesIcon },
      { name: 'Albums Sự Kiện', href: '/albums/event', icon: RectangleStackIcon },
      { name: 'File Station', href: '/synology-filestation', icon: FolderIcon }
    ]
  }
]

interface SidebarIOSProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function SidebarIOS({ open, setOpen }: SidebarIOSProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href.split('?')[0])
  }

  const hasActiveItem = (items: any[]) => {
    return items.some(item => isActive(item.href))
  }

  // Sidebar content (reusable for both desktop and mobile)
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="h-full bg-white flex flex-col border-r border-ios-gray-200">
      {/* Header - More compact */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-ios-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <img
            src="http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5448&cache_key=%225448_1759473933%22&type=%22unit%22&size=%22xl%22"
            alt="TVA Logo"
            className="w-8 h-8 rounded-lg object-cover"
          />
          {!isMobile && (
            <span className="text-base font-semibold text-ios-gray-900 tracking-tight">TVA</span>
          )}
        </div>

        {/* Close button (mobile only) */}
        {isMobile && (
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ios-gray-100 active:bg-ios-gray-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-ios-gray-600" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Navigation - More spacious */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {menuStructure.map((item, index) => {
          if (item.type === 'item') {
            // Regular menu item - Cleaner design
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setOpen(false)}
                className={clsx(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-ios-gray-100 text-ios-gray-900'
                    : 'text-ios-gray-700 hover:bg-ios-gray-50 hover:text-ios-gray-900'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.8} />
                <span>{item.name}</span>
              </Link>
            )
          } else {
            // Group with collapsible items - Cleaner design
            const GroupIcon = item.icon
            const groupHasActive = hasActiveItem(item.items)

            return (
              <Disclosure key={item.groupName} defaultOpen={groupHasActive}>
                {({ open: groupOpen }) => (
                  <div className="space-y-1">
                    {/* Group header - More subtle */}
                    <Disclosure.Button
                      className={clsx(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all',
                        groupHasActive
                          ? 'text-ios-gray-900'
                          : 'text-ios-gray-700 hover:bg-ios-gray-50'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <GroupIcon className="w-5 h-5 flex-shrink-0" strokeWidth={1.8} />
                        <span>{item.groupName}</span>
                      </div>
                      <ChevronRightIcon
                        className={clsx(
                          'w-4 h-4 text-ios-gray-500 transition-transform',
                          groupOpen ? 'transform rotate-90' : ''
                        )}
                        strokeWidth={2.5}
                      />
                    </Disclosure.Button>

                    {/* Group items - Cleaner spacing */}
                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="opacity-0 -translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition duration-150 ease-in"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 -translate-y-1"
                    >
                      <Disclosure.Panel className="space-y-0.5 pl-8 pt-1">
                        {item.items.map((subItem) => {
                          const SubIcon = subItem.icon
                          const active = isActive(subItem.href)

                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => isMobile && setOpen(false)}
                              className={clsx(
                                'flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                active
                                  ? 'bg-ios-gray-100 text-ios-gray-900'
                                  : 'text-ios-gray-600 hover:bg-ios-gray-50 hover:text-ios-gray-900'
                              )}
                            >
                              <SubIcon className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                              <span>{subItem.name}</span>
                            </Link>
                          )
                        })}
                      </Disclosure.Panel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            )
          }
        })}
      </nav>

      {/* User section - Cleaner */}
      <div className="border-t border-ios-gray-200 p-4 flex-shrink-0">
        <button className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg hover:bg-ios-gray-50 transition-all">
          <img
            src="http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5448&cache_key=%225448_1759473933%22&type=%22unit%22&size=%22xl%22"
            alt="User Avatar"
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-ios-gray-900 truncate">Admin</p>
            <p className="text-xs text-ios-gray-600 truncate">admin@tva.com</p>
          </div>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar - Always visible, more compact */}
      <div className="hidden lg:block lg:w-56 lg:flex-shrink-0">
        <div className="h-screen sticky top-0">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar - Dialog overlay */}
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
          </Transition.Child>

          {/* Sidebar panel */}
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-[280px]">
                <SidebarContent isMobile={true} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

