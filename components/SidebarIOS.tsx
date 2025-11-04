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
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'

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
      { name: 'Thanh lý', href: '/accessories/thanh-ly', icon: ArchiveBoxIcon }
    ]
  },

  // GROUP 3: Thư viện Công Trình (CẬP NHẬT)
  {
    type: 'group' as const,
    groupName: 'Thư Viện Công Trình',
    icon: BuildingOffice2Icon,
    items: [
      { name: 'Nhà dân', href: '/projects/khach-hang-le', icon: UserGroupIcon },
      { name: 'Dự án', href: '/projects/du-an', icon: BuildingOfficeIcon },
      { name: 'Upload kỹ thuật', href: '/projects/create-wizard', icon: ArrowUpTrayIcon },
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
      { name: 'Đối tác, khách hàng', href: '/albums/event', icon: RectangleStackIcon }
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
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: isMobile ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: isMobile ? 'none' : 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: isMobile ? 'none' : 'blur(20px) saturate(180%)',
        boxShadow: isMobile ? 'none' : 'var(--shadow-card)'
      }}
    >
      {/* Header - Apple style */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          height: '64px',
          padding: '0 var(--space-5)',
          borderBottom: `1px solid var(--border-light)`
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
            }}
          >
            <PhotoIcon className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          {!isMobile && (
            <span className="text-headline font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>
              Thư Viện Anh
            </span>
          )}
        </div>

        {/* Close button (mobile only) */}
        {isMobile && (
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center transition-all hover-scale"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <XMarkIcon className="w-5 h-5" strokeWidth={2} style={{ color: 'var(--text-secondary)' }} />
          </button>
        )}
      </div>

      {/* Navigation - Apple style */}
      <nav
        className="flex-1 overflow-y-auto"
        style={{
          padding: 'var(--space-4)',
          paddingTop: 'var(--space-5)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {menuStructure.map((item, index) => {
            if (item.type === 'item') {
              // Regular menu item - Apple style
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setOpen(false)}
                  className="flex items-center transition-all hover-lift"
                  style={{
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
                    color: active ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: '15px',
                    fontWeight: active ? 600 : 500,
                    letterSpacing: '-0.022em',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Icon
                    className="flex-shrink-0"
                    style={{
                      width: '20px',
                      height: '20px',
                      strokeWidth: 1.8,
                      color: active ? '#FFFFFF' : 'var(--text-secondary)'
                    }}
                  />
                  <span>{item.name}</span>
                </Link>
              )
            } else {
              // Group with collapsible items - Apple style
              const GroupIcon = item.icon
              const groupHasActive = hasActiveItem(item.items)

              return (
                <Disclosure key={item.groupName} defaultOpen={groupHasActive}>
                  {({ open: groupOpen }) => (
                    <div style={{ marginTop: index > 2 ? 'var(--space-4)' : '0' }}>
                      {/* Group header - Apple style */}
                      <Disclosure.Button
                        className="w-full flex items-center justify-between transition-all"
                        style={{
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                          <GroupIcon
                            className="flex-shrink-0"
                            style={{
                              width: '20px',
                              height: '20px',
                              strokeWidth: 1.8,
                              color: groupHasActive ? 'var(--accent-primary)' : 'var(--text-secondary)'
                            }}
                          />
                          <span
                            className="text-headline"
                            style={{
                              color: groupHasActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                              fontWeight: 600,
                              letterSpacing: '-0.022em'
                            }}
                          >
                            {item.groupName}
                          </span>
                        </div>
                        <ChevronRightIcon
                          style={{
                            width: '16px',
                            height: '16px',
                            color: 'var(--text-tertiary)',
                            strokeWidth: 2.5,
                            transform: groupOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform var(--transition-normal)'
                          }}
                        />
                      </Disclosure.Button>

                      {/* Group items - Apple style */}
                      <Transition
                        enter="transition duration-200 ease-out"
                        enterFrom="opacity-0 -translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition duration-150 ease-in"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 -translate-y-1"
                      >
                        <Disclosure.Panel
                          style={{
                            paddingLeft: 'var(--space-8)',
                            paddingTop: 'var(--space-2)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-1)'
                          }}
                        >
                          {item.items.map((subItem) => {
                            const SubIcon = subItem.icon
                            const active = isActive(subItem.href)

                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => isMobile && setOpen(false)}
                                className="flex items-center transition-all hover-lift"
                                style={{
                                  gap: 'var(--space-2)',
                                  padding: 'var(--space-2) var(--space-3)',
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: active ? 'var(--bg-tertiary)' : 'transparent',
                                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                  fontSize: '14px',
                                  fontWeight: active ? 600 : 500,
                                  letterSpacing: '-0.022em',
                                  textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => {
                                  if (!active) {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                                    e.currentTarget.style.color = 'var(--text-primary)'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!active) {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.color = 'var(--text-secondary)'
                                  }
                                }}
                              >
                                <SubIcon
                                  className="flex-shrink-0"
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    strokeWidth: 1.8
                                  }}
                                />
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
        </div>
      </nav>

      {/* User section - Apple style */}
      <div
        className="flex-shrink-0"
        style={{
          borderTop: `1px solid var(--border-light)`,
          padding: 'var(--space-4)'
        }}
      >
        <button
          className="flex items-center w-full transition-all hover-lift"
          style={{
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
            }}
          >
            <span
              className="font-semibold"
              style={{
                color: '#FFFFFF',
                fontSize: '14px'
              }}
            >
              A
            </span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p
              className="text-body-small font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              Admin
            </p>
            <p
              className="text-caption truncate"
              style={{ color: 'var(--text-tertiary)' }}
            >
              admin@tva.com
            </p>
          </div>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar - Always visible, Apple style */}
      <div
        className="hidden lg:block lg:flex-shrink-0"
        style={{ width: '240px' }}
      >
        <div className="h-screen sticky top-0">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar - Dialog overlay with Apple style */}
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          {/* Backdrop - Apple style blur */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            />
          </Transition.Child>

          {/* Sidebar panel */}
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel
                className="relative flex w-full"
                style={{
                  maxWidth: '280px',
                  marginRight: '64px'
                }}
              >
                <SidebarContent isMobile={true} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

