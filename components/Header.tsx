'use client'

import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-ios-gray-200 backdrop-blur-sm bg-opacity-95 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Left side - Menu button only */}
        <div className="flex items-center">
          {/* Menu button - Mobile only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-ios-gray-600 hover:bg-ios-gray-100 transition-colors"
            aria-label="Mở menu"
          >
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>

        {/* Right side - Search */}
        <div className="flex items-center space-x-3 ml-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4.5 w-4.5 text-ios-gray-500" strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="block w-56 lg:w-72 pl-10 pr-4 py-2 text-sm border border-ios-gray-300 rounded-lg bg-ios-gray-50 placeholder-ios-gray-500 focus:outline-none focus:bg-white focus:border-ios-blue focus:ring-2 focus:ring-ios-blue focus:ring-opacity-20 transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
