/**
 * Utility functions for category and category_path management
 */

export interface CategoryInfo {
  category: 'fabric' | 'accessory' | 'event' | 'collection' | 'project' | 'season' | 'client' | 'other'
  subcategory?: string
  categoryPath: string
  displayName: string
  storagePath: string
}

/**
 * Get category info from URL pathname
 * @param pathname - Current URL pathname (e.g., '/fabrics/moq', '/albums/fabric')
 * @returns CategoryInfo object
 */
export function getCategoryInfoFromPath(pathname: string): CategoryInfo {
  // Remove leading/trailing slashes and split
  const parts = pathname.replace(/^\/|\/$/g, '').split('/')
  
  // Handle /fabrics/moq, /fabrics/new, /fabrics/clearance
  if (parts[0] === 'fabrics' && parts[1]) {
    const subcategory = parts[1]
    return {
      category: 'fabric',
      subcategory,
      categoryPath: `fabrics/${subcategory}`,
      displayName: getDisplayName('fabric', subcategory),
      storagePath: `/Marketing/Ninh/thuvienanh/fabrics/${subcategory}`
    }
  }
  
  // Handle /fabrics (general)
  if (parts[0] === 'fabrics') {
    return {
      category: 'fabric',
      categoryPath: 'fabrics/general',
      displayName: 'Vải',
      storagePath: '/Marketing/Ninh/thuvienanh/fabrics/general'
    }
  }
  
  // Handle /albums/fabric
  if (parts[0] === 'albums' && parts[1] === 'fabric') {
    return {
      category: 'fabric',
      categoryPath: 'fabrics/general',
      displayName: 'Albums - Vải',
      storagePath: '/Marketing/Ninh/thuvienanh/fabrics/general'
    }
  }
  
  // Handle /albums/event
  if (parts[0] === 'albums' && parts[1] === 'event') {
    return {
      category: 'event',
      categoryPath: 'events',
      displayName: 'Albums - Sự kiện',
      storagePath: '/Marketing/Ninh/thuvienanh/events'
    }
  }
  
  // Handle /collections
  if (parts[0] === 'collections') {
    return {
      category: 'collection',
      categoryPath: 'collections',
      displayName: 'Bộ Sưu Tập',
      storagePath: '/Marketing/Ninh/thuvienanh/collections'
    }
  }
  
  // Default
  return {
    category: 'other',
    categoryPath: 'other',
    displayName: 'Khác',
    storagePath: '/Marketing/Ninh/thuvienanh/other'
  }
}

/**
 * Get display name for category and subcategory
 */
function getDisplayName(category: string, subcategory?: string): string {
  if (category === 'fabric') {
    if (subcategory === 'moq') return 'Vải Order theo MOQ'
    if (subcategory === 'new') return 'Vải Mới'
    if (subcategory === 'clearance') return 'Vải Thanh Lý'
    return 'Vải'
  }
  
  if (category === 'event') return 'Sự kiện'
  if (category === 'collection') return 'Bộ Sưu Tập'
  
  return 'Khác'
}

/**
 * Generate category_path from category and subcategory
 */
export function generateCategoryPath(
  category: 'fabric' | 'accessory' | 'event' | 'collection' | 'project' | 'season' | 'client' | 'other',
  subcategory?: string
): string {
  if (category === 'fabric') {
    if (subcategory) {
      return `fabrics/${subcategory}`
    }
    return 'fabrics/general'
  }
  
  if (category === 'event') return 'events'
  if (category === 'collection') return 'collections'
  
  return category
}

/**
 * Get Synology storage path from category_path
 */
export function getStoragePath(categoryPath: string): string {
  return `/Marketing/Ninh/thuvienanh/${categoryPath}`
}

/**
 * Parse category_path to get category and subcategory
 */
export function parseCategoryPath(categoryPath: string): {
  category: string
  subcategory?: string
} {
  const parts = categoryPath.split('/')
  
  if (parts[0] === 'fabrics') {
    return {
      category: 'fabric',
      subcategory: parts[1] === 'general' ? undefined : parts[1]
    }
  }
  
  if (parts[0] === 'events') {
    return { category: 'event' }
  }
  
  if (parts[0] === 'collections') {
    return { category: 'collection' }
  }
  
  return { category: parts[0] }
}

/**
 * Validate category_path format
 */
export function isValidCategoryPath(categoryPath: string): boolean {
  const validPaths = [
    'fabrics/moq',
    'fabrics/new',
    'fabrics/clearance',
    'fabrics/general',
    'events',
    'collections',
    'other'
  ]
  
  return validPaths.includes(categoryPath)
}

/**
 * Get all available category paths
 */
export function getAllCategoryPaths(): CategoryInfo[] {
  return [
    {
      category: 'fabric',
      subcategory: 'moq',
      categoryPath: 'fabrics/moq',
      displayName: 'Vải Order theo MOQ',
      storagePath: '/Marketing/Ninh/thuvienanh/fabrics/moq'
    },
    {
      category: 'fabric',
      subcategory: 'new',
      categoryPath: 'fabrics/new',
      displayName: 'Vải Mới',
      storagePath: '/Marketing/Ninh/thuvienanh/fabrics/new'
    },
    {
      category: 'fabric',
      subcategory: 'clearance',
      categoryPath: 'fabrics/clearance',
      displayName: 'Vải Thanh Lý',
      storagePath: '/Marketing/Ninh/thuvienanh/fabrics/clearance'
    },
    {
      category: 'fabric',
      categoryPath: 'fabrics/general',
      displayName: 'Vải (Chung)',
      storagePath: '/Marketing/Ninh/thuvienanh/fabrics/general'
    },
    {
      category: 'event',
      categoryPath: 'events',
      displayName: 'Sự kiện',
      storagePath: '/Marketing/Ninh/thuvienanh/events'
    },
    {
      category: 'collection',
      categoryPath: 'collections',
      displayName: 'Bộ Sưu Tập',
      storagePath: '/Marketing/Ninh/thuvienanh/collections'
    }
  ]
}

