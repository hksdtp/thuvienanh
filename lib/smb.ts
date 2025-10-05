// SMB (Server Message Block) Integration Service
// Tích hợp SMB protocol để upload files trực tiếp vào Synology NAS
// Sử dụng Synology FileStation API để truy cập SMB share

interface SMBConfig {
  host: string
  share: string
  username: string
  password: string
  targetPath: string
}

interface SMBUploadResult {
  success: boolean
  data?: {
    id: string
    filename: string
    path: string
    url: string
    size: number
  }
  error?: {
    code: number
    message: string
  }
}

interface SMBConnectionStatus {
  connected: boolean
  error?: string
  lastChecked: Date
}

class SMBService {
  private config: SMBConfig
  private sessionId: string | null = null
  private baseUrl: string

  constructor() {
    this.config = {
      host: process.env.SMB_HOST || '222.252.23.248',
      share: process.env.SMB_SHARE || 'marketing',
      username: process.env.SMB_USERNAME || 'haininh',
      password: process.env.SMB_PASSWORD || 'Villad24@',
      targetPath: '/marketing/Ninh/taomoi'
    }
    // Sử dụng cùng port với Synology service hiện tại
    this.baseUrl = process.env.SYNOLOGY_BASE_URL || `http://${this.config.host}:8888`
  }

  // Authenticate với Synology FileStation
  async authenticate(): Promise<boolean> {
    try {
      if (this.sessionId) {
        return true
      }

      console.log(`🔌 Authenticating to Synology FileStation: ${this.baseUrl}`)

      const response = await fetch(`${this.baseUrl}/webapi/auth.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api: 'SYNO.API.Auth',
          version: '3',
          method: 'login',
          account: this.config.username,
          passwd: this.config.password,
          session: 'FileStation',
          format: 'sid'
        })
      })

      const data = await response.json()

      if (data.success && data.data?.sid) {
        this.sessionId = data.data.sid
        console.log('✅ SMB FileStation authentication successful')
        return true
      } else {
        console.error('❌ SMB FileStation authentication failed:', data.error)
        return false
      }
    } catch (error) {
      console.error('❌ SMB FileStation authentication error:', error)
      return false
    }
  }

  // Logout từ Synology
  async logout(): Promise<void> {
    try {
      if (this.sessionId) {
        await fetch(`${this.baseUrl}/webapi/auth.cgi`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            api: 'SYNO.API.Auth',
            version: '3',
            method: 'logout',
            session: 'FileStation',
            _sid: this.sessionId
          })
        })
        this.sessionId = null
        console.log('🔌 SMB FileStation session closed')
      }
    } catch (error) {
      console.error('Error closing SMB session:', error)
    }
  }

  // Kiểm tra trạng thái kết nối
  async getConnectionStatus(): Promise<SMBConnectionStatus> {
    try {
      const connected = await this.authenticate()
      return {
        connected,
        lastChecked: new Date()
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date()
      }
    }
  }

  async listSharedFolders(): Promise<any> {
    try {
      if (!this.sessionId) {
        await this.authenticate()
      }

      const response = await fetch(`${this.baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.Info&version=2&method=get&_sid=${this.sessionId}`)
      const result = await response.json()

      console.log('📁 Shared folders:', result)
      return result
    } catch (error) {
      console.error('❌ Error listing shared folders:', error)
      throw error
    }
  }

  // Tạo thư mục nếu chưa tồn tại
  async ensureDirectory(dirPath: string): Promise<boolean> {
    try {
      if (!this.sessionId) {
        const authenticated = await this.authenticate()
        if (!authenticated) return false
      }

      // Nếu là root directory, không cần tạo
      if (dirPath === '/' || dirPath === '') {
        return true
      }

      // Tách parent path và folder name
      const pathParts = dirPath.split('/').filter(part => part.length > 0)
      if (pathParts.length === 0) return true

      const folderName = pathParts[pathParts.length - 1]
      const parentPath = pathParts.length > 1 ? '/' + pathParts.slice(0, -1).join('/') : '/'

      console.log(`🗂️ Creating directory: ${folderName} in ${parentPath}`)

      const response = await fetch(`${this.baseUrl}/webapi/entry.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api: 'SYNO.FileStation.CreateFolder',
          version: '2',
          method: 'create',
          _sid: this.sessionId!,
          folder_path: parentPath,
          name: folderName,
          force_parent: 'true'
        })
      })

      const result = await response.json()
      console.log(`📁 Directory creation result:`, result)

      return result.success || result.error?.code === 408 // 408 = folder already exists
    } catch (error) {
      console.error('❌ Error ensuring directory:', error)
      return false
    }
  }

  // Upload file lên SMB share qua FileStation
  async uploadFile(file: File, targetPath: string = '/marketing/Ninh/taomoi'): Promise<SMBUploadResult> {
    const maxRetries = 3
    let currentPath = targetPath

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Upload attempt ${attempt}/${maxRetries} for ${file.name} to ${currentPath}`)

        // Đảm bảo authentication
        if (!this.sessionId) {
          const authenticated = await this.authenticate()
          if (!authenticated) {
            return {
              success: false,
              error: { code: 500, message: 'Cannot authenticate to FileStation' }
            }
          }
        }

        // Thử tạo thư mục trước (chỉ cho attempt đầu tiên)
        if (attempt === 1 && currentPath !== '/') {
          const dirCreated = await this.ensureDirectory(currentPath)
          if (!dirCreated) {
            console.warn(`⚠️ Could not create directory ${currentPath}, falling back to marketing`)
            currentPath = '/marketing'
          }
        }

        // Tạo đường dẫn file đầy đủ
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`

        const fullPath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`
        console.log(`📤 Uploading ${file.name} to SMB via FileStation: ${fullPath}`)

        // Tạo FormData cho upload
        const formData = new FormData()
        formData.append('api', 'SYNO.FileStation.Upload')
        formData.append('version', '2')
        formData.append('method', 'upload')
        formData.append('_sid', this.sessionId!)
        formData.append('path', 'marketing')
        // Version 1 might not support these parameters
        // formData.append('create_parents', 'true')
        // formData.append('overwrite', 'true')
        formData.append('file', file, fileName)

        const response = await fetch(`${this.baseUrl}/webapi/entry.cgi`, {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (result.success) {
          console.log('✅ SMB upload successful via FileStation')
          return {
            success: true,
            data: {
              id: `smb_${timestamp}`,
              filename: fileName,
              path: fullPath,
              url: `smb://${this.config.host}${fullPath}`,
              size: file.size
            }
          }
        } else {
          console.error(`❌ SMB upload error (attempt ${attempt}):`, JSON.stringify(result, null, 2))

          // Nếu là error code 119 (No such file or directory) và chưa thử root
          if (result.error?.code === 119 && currentPath !== '/') {
            console.log('🔄 Switching to root directory due to path error')
            currentPath = '/'
            continue // Thử lại với root directory
          }

          // Nếu là attempt cuối cùng, return error
          if (attempt === maxRetries) {
            return {
              success: false,
              error: {
                code: result.error?.code || 500,
                message: result.error?.message || 'Upload failed after all retries'
              }
            }
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }

      } catch (error) {
        console.error(`❌ SMB upload error on attempt ${attempt}:`, error)

        if (attempt === maxRetries) {
          return {
            success: false,
            error: {
              code: 500,
              message: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }

    // Fallback return (should not reach here)
    return {
      success: false,
      error: { code: 500, message: 'Upload failed after all attempts' }
    }
  }

  // Upload nhiều files
  async uploadFiles(files: File[], targetPath: string = '/marketing/Ninh/taomoi'): Promise<SMBUploadResult[]> {
    const results: SMBUploadResult[] = []

    for (const file of files) {
      const result = await this.uploadFile(file, targetPath)
      results.push(result)
    }

    return results
  }

  // List files trong thư mục
  async listFiles(dirPath: string = '/marketing/Ninh/taomoi'): Promise<string[]> {
    try {
      if (!this.sessionId) {
        const authenticated = await this.authenticate()
        if (!authenticated) return []
      }

      const fullPath = dirPath

      const response = await fetch(`${this.baseUrl}/webapi/entry.cgi?` + new URLSearchParams({
        api: 'SYNO.FileStation.List',
        version: '2',
        method: 'list',
        _sid: this.sessionId!,
        folder_path: fullPath
      }))

      const result = await response.json()

      if (result.success && result.data?.files) {
        return result.data.files.map((file: any) => file.name)
      } else {
        console.error('Error listing SMB files:', result.error)
        return []
      }
    } catch (error) {
      console.error('Error listing SMB files:', error)
      return []
    }
  }

  // Xóa file
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (!this.sessionId) {
        const authenticated = await this.authenticate()
        if (!authenticated) return false
      }

      const response = await fetch(`${this.baseUrl}/webapi/entry.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api: 'SYNO.FileStation.Delete',
          version: '2',
          method: 'delete',
          _sid: this.sessionId!,
          path: filePath
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ SMB file deleted:', filePath)
        return true
      } else {
        console.error('Error deleting SMB file:', result.error)
        return false
      }
    } catch (error) {
      console.error('Error deleting SMB file:', error)
      return false
    }
  }

  // Get SMB URL cho file
  getSMBUrl(filePath: string): string {
    return `smb://${this.config.host}/${this.config.share}${filePath}`
  }

  // Get HTTP URL cho file (nếu Synology hỗ trợ web access)
  getHttpUrl(filePath: string): string {
    // Tạo HTTP URL để truy cập file qua web interface
    return `http://${this.config.host}:5000/fbdownload/${this.config.share}${filePath}`
  }
}

// Export singleton instance
export const smbService = new SMBService()
export default smbService

// Export types
export type { SMBConfig, SMBUploadResult, SMBConnectionStatus }
