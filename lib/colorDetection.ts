// Color Detection Utility
// Tự động phân tích và nhận diện màu sắc từ ảnh vải

/**
 * RGB Color interface
 */
export interface RGBColor {
  r: number
  g: number
  b: number
}

/**
 * Detected color with Vietnamese name
 */
export interface DetectedColor {
  rgb: RGBColor
  hex: string
  name: string
  confidence: number
}

/**
 * Vietnamese color names mapping
 * Dựa trên các màu phổ biến trong ngành vải
 */
const COLOR_NAMES: { [key: string]: { range: RGBColor[], name: string } } = {
  // Đỏ - Red tones
  red: {
    name: 'Đỏ',
    range: [
      { r: 180, g: 0, b: 0 },
      { r: 255, g: 100, b: 100 }
    ]
  },
  // Hồng - Pink tones
  pink: {
    name: 'Hồng',
    range: [
      { r: 255, g: 150, b: 150 },
      { r: 255, g: 220, b: 220 }
    ]
  },
  // Cam - Orange tones
  orange: {
    name: 'Cam',
    range: [
      { r: 200, g: 80, b: 0 },
      { r: 255, g: 180, b: 100 }
    ]
  },
  // Vàng - Yellow tones
  yellow: {
    name: 'Vàng',
    range: [
      { r: 200, g: 180, b: 0 },
      { r: 255, g: 255, b: 150 }
    ]
  },
  // Xanh lá - Green tones
  green: {
    name: 'Xanh lá',
    range: [
      { r: 0, g: 100, b: 0 },
      { r: 150, g: 255, b: 150 }
    ]
  },
  // Xanh dương - Blue tones
  blue: {
    name: 'Xanh dương',
    range: [
      { r: 0, g: 100, b: 180 },
      { r: 150, g: 200, b: 255 }
    ]
  },
  // Xanh navy - Navy blue
  navy: {
    name: 'Xanh navy',
    range: [
      { r: 0, g: 0, b: 80 },
      { r: 50, g: 50, b: 150 }
    ]
  },
  // Tím - Purple tones
  purple: {
    name: 'Tím',
    range: [
      { r: 100, g: 0, b: 100 },
      { r: 200, g: 100, b: 200 }
    ]
  },
  // Nâu - Brown tones
  brown: {
    name: 'Nâu',
    range: [
      { r: 80, g: 50, b: 20 },
      { r: 160, g: 120, b: 80 }
    ]
  },
  // Kem/Be - Beige/Cream tones
  beige: {
    name: 'Kem',
    range: [
      { r: 200, g: 180, b: 150 },
      { r: 255, g: 240, b: 220 }
    ]
  },
  // Xám - Gray tones
  gray: {
    name: 'Xám',
    range: [
      { r: 80, g: 80, b: 80 },
      { r: 180, g: 180, b: 180 }
    ]
  },
  // Trắng - White
  white: {
    name: 'Trắng',
    range: [
      { r: 200, g: 200, b: 200 },
      { r: 255, g: 255, b: 255 }
    ]
  },
  // Đen - Black
  black: {
    name: 'Đen',
    range: [
      { r: 0, g: 0, b: 0 },
      { r: 60, g: 60, b: 60 }
    ]
  }
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Calculate color distance using Euclidean distance
 */
function colorDistance(c1: RGBColor, c2: RGBColor): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  )
}

/**
 * Check if color is within range
 */
function isColorInRange(color: RGBColor, range: RGBColor[]): boolean {
  const [min, max] = range
  return (
    color.r >= min.r && color.r <= max.r &&
    color.g >= min.g && color.g <= max.g &&
    color.b >= min.b && color.b <= max.b
  )
}

/**
 * Get Vietnamese color name from RGB
 */
export function getColorName(rgb: RGBColor): string {
  // Check exact ranges first
  for (const [key, colorDef] of Object.entries(COLOR_NAMES)) {
    if (isColorInRange(rgb, colorDef.range)) {
      return colorDef.name
    }
  }

  // If no exact match, find closest color
  let minDistance = Infinity
  let closestColor = 'Khác'

  for (const [key, colorDef] of Object.entries(COLOR_NAMES)) {
    const centerColor = {
      r: (colorDef.range[0].r + colorDef.range[1].r) / 2,
      g: (colorDef.range[0].g + colorDef.range[1].g) / 2,
      b: (colorDef.range[0].b + colorDef.range[1].b) / 2
    }
    
    const distance = colorDistance(rgb, centerColor)
    if (distance < minDistance) {
      minDistance = distance
      closestColor = colorDef.name
    }
  }

  return closestColor
}

/**
 * Extract dominant colors from image using Canvas API
 */
export async function extractDominantColors(
  imageFile: File,
  numColors: number = 3
): Promise<DetectedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Cannot get canvas context'))
            return
          }

          // Resize image for faster processing
          const maxSize = 200
          const scale = Math.min(maxSize / img.width, maxSize / img.height)
          canvas.width = img.width * scale
          canvas.height = img.height * scale

          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const pixels = imageData.data

          // Sample pixels (every 10th pixel for performance)
          const colorMap = new Map<string, number>()
          
          for (let i = 0; i < pixels.length; i += 40) { // RGBA = 4 bytes, skip 10 pixels
            const r = pixels[i]
            const g = pixels[i + 1]
            const b = pixels[i + 2]
            const a = pixels[i + 3]

            // Skip transparent pixels
            if (a < 128) continue

            // Quantize colors (reduce to 32 levels per channel)
            const qr = Math.round(r / 8) * 8
            const qg = Math.round(g / 8) * 8
            const qb = Math.round(b / 8) * 8

            const key = `${qr},${qg},${qb}`
            colorMap.set(key, (colorMap.get(key) || 0) + 1)
          }

          // Sort by frequency
          const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, numColors)

          // Convert to DetectedColor format
          const totalPixels = sortedColors.reduce((sum, [, count]) => sum + count, 0)
          
          const detectedColors: DetectedColor[] = sortedColors.map(([colorKey, count]) => {
            const [r, g, b] = colorKey.split(',').map(Number)
            const rgb = { r, g, b }
            
            return {
              rgb,
              hex: rgbToHex(r, g, b),
              name: getColorName(rgb),
              confidence: count / totalPixels
            }
          })

          resolve(detectedColors)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(imageFile)
  })
}

/**
 * Get primary color from image (most dominant)
 */
export async function getPrimaryColor(imageFile: File): Promise<DetectedColor> {
  const colors = await extractDominantColors(imageFile, 1)
  return colors[0]
}

/**
 * Batch process multiple images
 */
export async function batchExtractColors(
  imageFiles: File[]
): Promise<Map<string, DetectedColor[]>> {
  const results = new Map<string, DetectedColor[]>()
  
  for (const file of imageFiles) {
    try {
      const colors = await extractDominantColors(file, 3)
      results.set(file.name, colors)
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error)
      results.set(file.name, [])
    }
  }
  
  return results
}

