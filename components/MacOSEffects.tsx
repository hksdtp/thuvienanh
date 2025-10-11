'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

// macOS style window with traffic lights
export function MacOSWindow({ 
  children, 
  title = '',
  className = '' 
}: { 
  children: ReactNode
  title?: string
  className?: string 
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      className={`bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden ${className}`}
    >
      <div className="bg-gray-100/80 backdrop-blur px-4 py-3 flex items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors cursor-pointer" />
          <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors cursor-pointer" />
        </div>
        {title && (
          <span className="ml-4 text-sm font-medium text-gray-700">{title}</span>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  )
}

// iOS style blur card
export function BlurCard({ 
  children, 
  className = '',
  intensity = 'md'
}: { 
  children: ReactNode
  className?: string
  intensity?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const blurIntensity = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        bg-white/70 ${blurIntensity[intensity]} 
        rounded-2xl shadow-lg border border-white/50
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

// Dock-like navigation
export function DockNav({ items }: { items: Array<{ icon: ReactNode; label: string; href: string }> }) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-black/20 backdrop-blur-2xl rounded-2xl p-2 flex space-x-2 shadow-2xl">
        {items.map((item, index) => (
          <motion.a
            key={index}
            href={item.href}
            whileHover={{ y: -10, scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="relative group"
          >
            <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center shadow-lg">
              {item.icon}
            </div>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </span>
          </motion.a>
        ))}
      </div>
    </motion.div>
  )
}

// Spotlight effect on hover
export function SpotlightCard({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      whileHover="hover"
    >
      <motion.div
        className="absolute inset-0 opacity-0"
        variants={{
          hover: {
            opacity: 1,
          },
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20" />
      </motion.div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// Elastic button with haptic-like feedback
export function ElasticButton({ 
  children, 
  onClick,
  className = '',
  variant = 'primary'
}: { 
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 15,
      }}
      className={`
        px-6 py-3 rounded-xl font-medium
        transition-colors duration-200
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
