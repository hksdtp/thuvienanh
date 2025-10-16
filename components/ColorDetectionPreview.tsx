'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { DetectedColor, extractDominantColors } from '@/lib/colorDetection'

interface ColorDetectionPreviewProps {
  imageFile: File
  onColorSelect: (colorName: string) => void
  selectedColor?: string
}

export default function ColorDetectionPreview({
  imageFile,
  onColorSelect,
  selectedColor
}: ColorDetectionPreviewProps) {
  const [colors, setColors] = useState<DetectedColor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    detectColors()
  }, [imageFile])

  const detectColors = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const detectedColors = await extractDominantColors(imageFile, 5)
      setColors(detectedColors)
      
      // Auto-select the most dominant color
      if (detectedColors.length > 0 && !selectedColor) {
        onColorSelect(detectedColors[0].name)
      }
    } catch (err) {
      console.error('Color detection error:', err)
      setError('Không thể phân tích màu sắc')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <SparklesIcon className="w-5 h-5 text-cyan-500" />
        </motion.div>
        <span>Đang phân tích màu sắc...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <SparklesIcon className="w-5 h-5 text-cyan-500" />
        <span className="text-sm font-medium text-gray-900">
          Màu sắc được nhận diện
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <AnimatePresence>
          {colors.map((color, index) => (
            <motion.button
              key={color.hex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onColorSelect(color.name)}
              className={`
                relative group rounded-lg overflow-hidden border-2 transition-all
                ${selectedColor === color.name 
                  ? 'border-cyan-500 ring-2 ring-cyan-500 ring-opacity-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              title={`${color.name} (${Math.round(color.confidence * 100)}%)`}
            >
              {/* Color swatch */}
              <div 
                className="aspect-square w-full"
                style={{ backgroundColor: color.hex }}
              />
              
              {/* Selected indicator */}
              {selectedColor === color.name && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-cyan-500" strokeWidth={3} />
                  </div>
                </motion.div>
              )}

              {/* Confidence badge */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {Math.round(color.confidence * 100)}%
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Color name display */}
      {selectedColor && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-600 text-center"
        >
          Đã chọn: <span className="font-medium text-gray-900">{selectedColor}</span>
        </motion.div>
      )}
    </div>
  )
}

