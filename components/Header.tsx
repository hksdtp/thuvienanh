'use client'

import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border-light)'
      }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 md:px-6 py-3">
        {/* Left side - Menu button */}
        <div className="flex items-center gap-4">
          {/* Menu button - Mobile only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-black/5 transition-colors active:scale-95"
            aria-label="Mở menu"
          >
            <Bars3Icon className="h-6 w-6" strokeWidth={2} style={{ color: 'var(--text-primary)' }} />
          </button>

          {/* Logo/Title - Desktop */}
          <h1 className="hidden lg:block text-headline font-semibold" style={{ color: 'var(--text-primary)' }}>
            Thư Viện Anh
          </h1>
        </div>

        {/* Right side - Search */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5" strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="block w-48 md:w-64 lg:w-80 pl-10 pr-4 py-2 text-body-small transition-all"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid transparent',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'var(--bg-primary)'
                e.target.style.borderColor = 'var(--accent-primary)'
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'var(--bg-secondary)'
                e.target.style.borderColor = 'transparent'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
