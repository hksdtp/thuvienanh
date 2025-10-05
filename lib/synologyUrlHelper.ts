// Synology URL Helper Functions
// Generate URLs for thumbnails, downloads, and sharing from Synology Photos API

interface SynologyConfig {
  baseUrl: string
  sessionId: string
}

/**
 * Generate thumbnail URL from Synology Photos API
 * Uses SYNO.Foto.Thumbnail API
 */
export function generateSynologyThumbnailUrl(
  fileId: number,
  config: SynologyConfig,
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md'
): string {
  const sizeMap = {
    sm: 'sm',   // 120x120
    md: 'm',    // 320x320
    lg: 'xl',   // 1280x1280
    xl: 'xl'    // Original size
  }

  const params = new URLSearchParams({
    api: 'SYNO.Foto.Thumbnail',
    method: 'get',
    version: '1',
    id: fileId.toString(),
    size: sizeMap[size],
    type: 'unit',
    _sid: config.sessionId
  })

  return `${config.baseUrl}/photo/webapi/entry.cgi?${params.toString()}`
}

/**
 * Generate download URL from Synology Photos API
 * Uses SYNO.Foto.Download API
 */
export function generateSynologyDownloadUrl(
  fileId: number,
  config: SynologyConfig
): string {
  const params = new URLSearchParams({
    api: 'SYNO.Foto.Download',
    method: 'download',
    version: '1',
    id: fileId.toString(),
    _sid: config.sessionId
  })

  return `${config.baseUrl}/photo/webapi/entry.cgi?${params.toString()}`
}

/**
 * Create public sharing link (no session required)
 * Requires creating shared link first
 */
export async function createPublicShareLink(
  fileId: number,
  config: SynologyConfig
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      api: 'SYNO.Foto.Sharing.Passphrase',
      method: 'create',
      version: '1',
      item_id: `[${fileId}]`,
      _sid: config.sessionId
    })

    const response = await fetch(
      `${config.baseUrl}/photo/webapi/entry.cgi?${params.toString()}`,
      { method: 'POST' }
    )

    const result = await response.json()
    
    if (result.success && result.data?.passphrase) {
      return `${config.baseUrl}/photo/mo/sharing/${result.data.passphrase}`
    }

    return null
  } catch (error) {
    console.error('Error creating public share link:', error)
    return null
  }
}

/**
 * Generate multiple thumbnail sizes at once
 */
export function generateThumbnailSet(
  fileId: number,
  config: SynologyConfig
): {
  small: string
  medium: string
  large: string
  original: string
} {
  return {
    small: generateSynologyThumbnailUrl(fileId, config, 'sm'),
    medium: generateSynologyThumbnailUrl(fileId, config, 'md'),
    large: generateSynologyThumbnailUrl(fileId, config, 'lg'),
    original: generateSynologyDownloadUrl(fileId, config)
  }
}

