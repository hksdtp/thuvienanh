// Thumbnail generation utilities for Synology and local images

interface ThumbnailOptions {
  width?: number
  height?: number
  quality?: number
}

const DEFAULT_THUMBNAIL_OPTIONS: ThumbnailOptions = {
  width: 300,
  height: 300,
  quality: 80
}

/**
 * Generate thumbnail URL for Synology images
 * Uses Synology FileStation API to generate thumbnails
 */
export function generateSynologyThumbnail(
  imageUrl: string,
  sessionId: string,
  options: ThumbnailOptions = {}
): string {
  const opts = { ...DEFAULT_THUMBNAIL_OPTIONS, ...options }

  // Check if it's a Synology URL
  if (!imageUrl.includes('webapi/entry.cgi') && !imageUrl.includes('fbdownload')) {
    return imageUrl // Not a Synology URL, return original
  }

  // Extract base URL and path from the image URL
  const urlObj = new URL(imageUrl)
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`
  
  // Extract path from the image URL
  let imagePath = ''
  if (imageUrl.includes('fbdownload')) {
    // Format: http://host/fbdownload/path/to/image.jpg
    imagePath = imageUrl.split('fbdownload')[1]
  } else if (imageUrl.includes('path=')) {
    // Format: http://host/webapi/entry.cgi?...&path=/path/to/image.jpg
    const pathMatch = imageUrl.match(/path=([^&]+)/)
    if (pathMatch) {
      imagePath = decodeURIComponent(pathMatch[1])
    }
  }

  if (!imagePath) {
    return imageUrl // Cannot extract path, return original
  }

  // Generate thumbnail URL using FileStation Thumb API
  const thumbnailUrl = `${baseUrl}/webapi/entry.cgi?` + new URLSearchParams({
    api: 'SYNO.FileStation.Thumb',
    version: '2',
    method: 'get',
    path: imagePath,
    size: 'large', // Options: small, medium, large
    _sid: sessionId
  }).toString()

  return thumbnailUrl
}

/**
 * Generate thumbnail URL for local images
 * For local images, we can use Next.js Image Optimization API
 */
export function generateLocalThumbnail(
  imageUrl: string,
  options: ThumbnailOptions = {}
): string {
  const opts = { ...DEFAULT_THUMBNAIL_OPTIONS, ...options }

  // Check if it's a local URL
  if (!imageUrl.startsWith('/uploads/')) {
    return imageUrl // Not a local URL, return original
  }

  // Use Next.js Image Optimization API
  // Format: /_next/image?url=/uploads/...&w=300&q=80
  const thumbnailUrl = `/_next/image?` + new URLSearchParams({
    url: imageUrl,
    w: opts.width?.toString() || '300',
    q: opts.quality?.toString() || '80'
  }).toString()

  return thumbnailUrl
}

/**
 * Auto-detect image type and generate appropriate thumbnail
 */
export function generateThumbnail(
  imageUrl: string,
  sessionId?: string,
  options: ThumbnailOptions = {}
): string {
  // Check if it's a Synology URL
  if (imageUrl.includes('webapi/entry.cgi') || imageUrl.includes('fbdownload')) {
    if (!sessionId) {
      console.warn('Synology thumbnail requires sessionId, returning original URL')
      return imageUrl
    }
    return generateSynologyThumbnail(imageUrl, sessionId, options)
  }

  // Check if it's a local URL
  if (imageUrl.startsWith('/uploads/')) {
    return generateLocalThumbnail(imageUrl, options)
  }

  // Unknown URL type, return original
  return imageUrl
}

/**
 * Check if an image URL is from Synology
 */
export function isSynologyImage(imageUrl: string): boolean {
  return imageUrl.includes('webapi/entry.cgi') || imageUrl.includes('fbdownload')
}

/**
 * Check if an image URL is local
 */
export function isLocalImage(imageUrl: string): boolean {
  return imageUrl.startsWith('/uploads/')
}

/**
 * Get image storage type
 */
export function getImageStorageType(imageUrl: string): 'synology' | 'local' | 'external' {
  if (isSynologyImage(imageUrl)) return 'synology'
  if (isLocalImage(imageUrl)) return 'local'
  return 'external'
}

