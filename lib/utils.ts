/**
 * Utility functions for the application
 */

/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành slug không dấu, an toàn cho tên file/folder
 * 
 * @param text - Chuỗi cần chuyển đổi
 * @param options - Tùy chọn
 * @returns Slug đã được chuẩn hóa
 * 
 * @example
 * slugify("Vải Hoa Xuân 2024 - Đẹp & Sang Trọng")
 * // => "vai-hoa-xuan-2024-dep-sang-trong"
 * 
 * slugify("Áo Dài Truyền Thống (Mẫu Mới)")
 * // => "ao-dai-truyen-thong-mau-moi"
 */
export function slugify(
  text: string,
  options: {
    lowercase?: boolean
    separator?: string
    maxLength?: number
  } = {}
): string {
  const {
    lowercase = true,
    separator = '-',
    maxLength = 100
  } = options

  // Bảng chuyển đổi ký tự tiếng Việt có dấu sang không dấu
  const vietnameseMap: Record<string, string> = {
    // Chữ thường
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    
    // Chữ hoa
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D',
  }

  let slug = text.trim()

  // Chuyển đổi ký tự tiếng Việt
  slug = slug.split('').map(char => vietnameseMap[char] || char).join('')

  // Chuyển thành chữ thường nếu cần
  if (lowercase) {
    slug = slug.toLowerCase()
  }

  // Thay thế các ký tự đặc biệt và khoảng trắng bằng separator
  slug = slug
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt (giữ lại chữ, số, space, dấu gạch ngang)
    .replace(/\s+/g, separator)       // Thay khoảng trắng bằng separator
    .replace(new RegExp(`${separator}+`, 'g'), separator) // Loại bỏ separator trùng lặp
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '') // Loại bỏ separator ở đầu/cuối

  // Giới hạn độ dài
  if (maxLength && slug.length > maxLength) {
    slug = slug.substring(0, maxLength)
    // Loại bỏ separator ở cuối nếu bị cắt giữa chừng
    slug = slug.replace(new RegExp(`${separator}$`), '')
  }

  return slug
}

/**
 * Tạo folder name an toàn từ album name
 * Giữ nguyên tên album, chỉ loại bỏ ký tự đặc biệt không an toàn
 *
 * @param albumName - Tên album
 * @param albumId - UUID của album (không sử dụng, giữ để tương thích)
 * @returns Tên folder an toàn cho file system
 *
 * @example
 * createFolderName("Vải Hoa Xuân 2024", "9c9b28e6-ecea-425f-a3f0-dda1097c6a28")
 * // => "Vải Hoa Xuân 2024"
 * createFolderName("123", "9c9b28e6-ecea-425f-a3f0-dda1097c6a28")
 * // => "123"
 */
export function createFolderName(albumName: string, albumId: string): string {
  // Giữ nguyên tên album, chỉ loại bỏ các ký tự không an toàn cho file system
  // Loại bỏ: / \ : * ? " < > |
  const safeName = albumName
    .replace(/[\/\\:*?"<>|]/g, '') // Loại bỏ ký tự không hợp lệ
    .trim()

  // Nếu sau khi loại bỏ ký tự đặc biệt mà tên rỗng, dùng "album"
  return safeName || 'album'
}

/**
 * Tạo file name an toàn từ tên file gốc
 * 
 * @param fileName - Tên file gốc
 * @returns Tên file đã được chuẩn hóa
 * 
 * @example
 * sanitizeFileName("Ảnh Đẹp (2024).jpg")
 * // => "anh-dep-2024.jpg"
 */
export function sanitizeFileName(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.')
  const name = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName
  const ext = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : ''
  
  const safeName = slugify(name, { maxLength: 100 })
  
  return safeName + ext.toLowerCase()
}

