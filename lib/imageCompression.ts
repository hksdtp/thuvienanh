/**
 * Image Compression Utility
 * Compresses images on client-side before upload
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeMB?: number
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  maxSizeMB: 2
}

/**
 * Compress an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Skip compression for small files
  if (file.size / 1024 / 1024 < (opts.maxSizeMB || 2)) {
    console.log('📦 File already small, skipping compression:', file.name)
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img
          const maxWidth = opts.maxWidth || 1920
          const maxHeight = opts.maxHeight || 1080

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = Math.floor(width * ratio)
            height = Math.floor(height * ratio)
          }

          // Create canvas
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Draw image
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'))
                return
              }

              // Create new file
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })

              const originalSizeMB = (file.size / 1024 / 1024).toFixed(2)
              const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2)
              const reduction = (((file.size - compressedFile.size) / file.size) * 100).toFixed(1)

              console.log(`✅ Compressed ${file.name}:`)
              console.log(`   Original: ${originalSizeMB} MB`)
              console.log(`   Compressed: ${compressedSizeMB} MB`)
              console.log(`   Reduction: ${reduction}%`)

              resolve(compressedFile)
            },
            file.type,
            opts.quality || 0.8
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Could not load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Could not read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Compress multiple images
 * @param files - Array of image files
 * @param options - Compression options
 * @param onProgress - Progress callback
 * @returns Array of compressed files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressed: File[] = []

  for (let i = 0; i < files.length; i++) {
    try {
      const compressedFile = await compressImage(files[i], options)
      compressed.push(compressedFile)
      
      if (onProgress) {
        onProgress(i + 1, files.length)
      }
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error)
      // Use original file if compression fails
      compressed.push(files[i])
    }
  }

  return compressed
}

/**
 * Create thumbnail from image file
 * @param file - The image file
 * @param size - Thumbnail size (width and height)
 * @returns Thumbnail file
 */
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<File> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7
  })
}

