// Synology Photos API Integration
// Documentation: https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/PhotoStation/All/enu/Synology_Photo_Station_Photo_API.pdf
// Synology Photos API: https://<IP_ADDRESS>/photo/webapi/entry.cgi?api=SYNO.API.Info&version=1&method=query&query=all

import {
  generateSynologyThumbnailUrl,
  generateSynologyDownloadUrl
} from './synologyUrlHelper'

interface SynologyConfig {
  baseUrl: string
  alternativeUrl?: string
  username: string
  password: string
}

interface SynologyAuthResponse {
  success: boolean
  data?: {
    sid: string
    did?: string
  }
  error?: {
    code: number
    message: string
  }
}

interface SynologyPhotosUploadData {
  id: number
  filename: string
  folder_id?: number
  filesize: number
  time: number
  indexed_time?: number
  owner_user_id?: number
  type?: string
}

interface SynologyUploadResponse {
  success: boolean
  data?: {
    id: string
    filename: string
    url: string
    path: string
    thumbnailUrl?: string
    synologyId?: number
    folderId?: number
  }
  error?: {
    code: number
    message: string
  }
}

interface FileStationUploadResponse {
  success: boolean
  data?: {
    blSkip: boolean
    file: string
    pid: number
    progress: number
    status: string
  }[]
  error?: {
    code: number
    message: string
  }
}

// Synology Photos API interfaces
interface SynologyPhotosFolder {
  id: number
  name: string
  owner_user_id: number
  parent: number
  passphrase: string
  shared: boolean
  sort_by: string
  sort_direction: string
  type: string
}

interface SynologyPhotosAlbum {
  id: number
  name: string
  item_count: number
  shared: boolean
  passphrase: string
  create_time: number
  start_time: number
  end_time: number
}

interface SynologyPhotosListResponse {
  success: boolean
  data?: {
    list: SynologyPhotosFolder[] | SynologyPhotosAlbum[]
  }
  error?: {
    code: number
  }
}

export class SynologyFileStationService {
  private config: SynologyConfig
  private sessionId: string | null = null
  private workingUrl: string | null = null

  constructor() {
    this.config = {
      baseUrl: process.env.SYNOLOGY_BASE_URL || 'http://222.252.23.248:8888',
      alternativeUrl: process.env.SYNOLOGY_ALTERNATIVE_URL || 'http://222.252.23.248:6868',
      username: process.env.SYNOLOGY_USERNAME || 'haininh',
      password: process.env.SYNOLOGY_PASSWORD || 'Villad24@'
    }
  }

  // Test connection to a URL
  private async testConnectionToUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query&query=SYNO.FileStation.Info`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      return response.ok
    } catch (error) {
      console.log(`Connection test failed for ${url}:`, error)
      return false
    }
  }

  // Get working base URL
  private async getWorkingUrl(): Promise<string> {
    // Test primary URL first
    if (await this.testConnectionToUrl(this.config.baseUrl)) {
      return this.config.baseUrl
    }

    // Test alternative URL
    if (this.config.alternativeUrl && await this.testConnectionToUrl(this.config.alternativeUrl)) {
      return this.config.alternativeUrl
    }

    throw new Error('Cannot connect to any Synology URL')
  }

  // Authenticate with File Station
  async authenticate(): Promise<boolean> {
    try {
      const baseUrl = await this.getWorkingUrl()
      this.workingUrl = baseUrl

      const response = await fetch(`${baseUrl}/webapi/auth.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api: 'SYNO.API.Auth',
          version: '6',
          method: 'login',
          account: this.config.username,
          passwd: this.config.password,
          session: 'FileStation',
          format: 'sid'
        })
      })

      const data: SynologyAuthResponse = await response.json()

      if (data.success && data.data?.sid) {
        this.sessionId = data.data.sid
        console.log('✅ File Station authentication successful')
        return true
      } else {
        console.error('❌ File Station authentication failed:', data.error)
        return false
      }
    } catch (error) {
      console.error('❌ File Station authentication error:', error)
      return false
    }
  }

  // Upload file to File Station
  async uploadFile(file: File, destinationPath: string = '/volume1'): Promise<SynologyUploadResponse> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) {
          throw new Error('Authentication failed')
        }
      }

      const formData = new FormData()

      formData.append('api', 'SYNO.FileStation.Upload')
      formData.append('version', '2')
      formData.append('method', 'upload')
      formData.append('path', destinationPath)
      formData.append('create_parents', 'true')
      formData.append('overwrite', 'true')
      formData.append('file', file, file.name)

      console.log(`📤 FileStation upload request:`)
      console.log(`   URL: ${this.workingUrl}/webapi/entry.cgi`)
      console.log(`   Session ID: ${this.sessionId?.substring(0, 10)}...`)
      console.log(`   Path: ${destinationPath}`)
      console.log(`   File: ${file.name} (${file.size} bytes)`)

      const response = await fetch(`${this.workingUrl}/webapi/entry.cgi`, {
        method: 'POST',
        headers: {
          'Cookie': `id=${this.sessionId}`
        },
        body: formData
      })

      const result: FileStationUploadResponse = await response.json()
      console.log('📋 File Station upload response:', JSON.stringify(result, null, 2))

      if (result.success) {
        return {
          success: true,
          data: {
            id: Date.now().toString(),
            filename: file.name,
            url: `${this.workingUrl}/fbdownload/${destinationPath}/${file.name}`,
            path: `${destinationPath}/${file.name}`
          }
        }
      } else {
        console.error('❌ File Station upload error details:', result.error)
        return {
          success: false,
          error: result.error || { code: -1, message: 'Upload failed' }
        }
      }
    } catch (error) {
      console.error('❌ File Station upload error:', error)
      return {
        success: false,
        error: { code: -1, message: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  // Delete file from File Station
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) {
          throw new Error('Authentication failed')
        }
      }

      console.log(`🗑️ Deleting file from FileStation: ${filePath}`)

      const response = await fetch(`${this.workingUrl}/webapi/entry.cgi`, {
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
      console.log('📋 File Station delete response:', JSON.stringify(result, null, 2))

      if (result.success) {
        console.log('✅ File deleted successfully:', filePath)
        return true
      } else {
        console.error('❌ File Station delete error:', result.error)
        return false
      }
    } catch (error) {
      console.error('❌ File Station delete error:', error)
      return false
    }
  }

  // Create folder in File Station
  async createFolder(folderPath: string): Promise<boolean> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) {
          throw new Error('Authentication failed')
        }
      }

      console.log(`📁 Creating folder in FileStation: ${folderPath}`)

      // Split path to get parent folder and folder name
      const lastSlashIndex = folderPath.lastIndexOf('/')
      const parentPath = folderPath.substring(0, lastSlashIndex) || '/'
      const folderName = folderPath.substring(lastSlashIndex + 1)

      console.log(`📁 Parent path: ${parentPath}, Folder name: ${folderName}`)

      const response = await fetch(`${this.workingUrl}/webapi/entry.cgi`, {
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
          force_parent: 'true', // Create parent folders if they don't exist
        }),
      })

      const result = await response.json()
      console.log('📋 File Station create folder response:', JSON.stringify(result, null, 2))

      if (result.success) {
        console.log(`✅ Folder created successfully: ${folderPath}`)
        return true
      } else {
        console.error('❌ File Station create folder error:', result.error)
        return false
      }
    } catch (error) {
      console.error('❌ Error creating folder:', error)
      return false
    }
  }

  // Delete folder from File Station
  async deleteFolder(folderPath: string): Promise<boolean> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) {
          throw new Error('Authentication failed')
        }
      }

      console.log(`🗑️ Deleting folder from FileStation: ${folderPath}`)

      const response = await fetch(`${this.workingUrl}/webapi/entry.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api: 'SYNO.FileStation.Delete',
          version: '2',
          method: 'delete',
          _sid: this.sessionId!,
          path: folderPath,
          recursive: 'true' // Delete folder and all contents
        })
      })

      const result = await response.json()
      console.log('📋 File Station delete folder response:', JSON.stringify(result, null, 2))

      if (result.success) {
        console.log('✅ Folder deleted successfully:', folderPath)
        return true
      } else {
        console.error('❌ File Station delete folder error:', result.error)
        return false
      }
    } catch (error) {
      console.error('❌ File Station delete folder error:', error)
      return false
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const baseUrl = await this.getWorkingUrl()
      return await this.testConnectionToUrl(baseUrl)
    } catch {
      return false
    }
  }
}

class SynologyPhotosService {
  private config: SynologyConfig
  private sessionId: string | null = null

  constructor() {
    this.config = {
      // Use port 6868 for Synology Photos API
      baseUrl: process.env.SYNOLOGY_PHOTOS_URL || 'http://222.252.23.248:6868',
      alternativeUrl: process.env.SYNOLOGY_ALTERNATIVE_URL || 'http://incanto.myds.me:6868',
      username: process.env.SYNOLOGY_USERNAME || 'haininh',
      password: process.env.SYNOLOGY_PASSWORD || 'villad24@'
    }
  }

  // Test connection to a URL
  private async testConnection(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query&query=all`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      return response.ok
    } catch (error) {
      console.warn(`Connection test failed for ${url}:`, error)
      return false
    }
  }

  // Find working URL
  private async findWorkingUrl(): Promise<string | null> {
    const urls = [this.config.baseUrl]
    if (this.config.alternativeUrl) {
      urls.push(this.config.alternativeUrl)
    }

    for (const url of urls) {
      console.log(`Testing connection to: ${url}`)
      const isWorking = await this.testConnection(url)
      if (isWorking) {
        console.log(`✅ Connection successful: ${url}`)
        return url
      }
      console.log(`❌ Connection failed: ${url}`)
    }

    return null
  }

  // Authenticate with Synology
  async authenticate(): Promise<boolean> {
    try {
      // Find working URL first
      const workingUrl = await this.findWorkingUrl()
      if (!workingUrl) {
        console.error('Cannot connect to any Synology server URLs')
        return false
      }

      // Update baseUrl to working URL
      this.config.baseUrl = workingUrl

      // Get API info
      const apiInfoResponse = await fetch(`${workingUrl}/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query&query=all`)
      const apiInfo = await apiInfoResponse.json()
      console.log('Synology API Info:', apiInfo)

      // Try different authentication methods
      const authMethods = [
        { session: 'FileStation', api: 'SYNO.API.Auth' },
        { session: 'PhotoStation', api: 'SYNO.API.Auth' },
        { session: 'SynologyPhotos', api: 'SYNO.API.Auth' },
        { session: 'DownloadStation', api: 'SYNO.API.Auth' }
      ]

      for (const method of authMethods) {
        try {
          console.log(`Trying authentication with session: ${method.session}`)
          const response = await fetch(`${workingUrl}/webapi/auth.cgi`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              api: method.api,
              version: '3',
              method: 'login',
              account: this.config.username,
              passwd: this.config.password,
              session: method.session,
              format: 'sid'
            })
          })

          const result: SynologyAuthResponse = await response.json()
          console.log(`Auth result for ${method.session}:`, result)

          if (result.success && result.data?.sid) {
            this.sessionId = result.data.sid
            console.log(`✅ Synology authentication successful with session: ${method.session}`)
            return true
          }

          console.warn(`❌ Authentication failed for session ${method.session}:`, result.error)
        } catch (error) {
          console.warn(`❌ Error trying session ${method.session}:`, error)
        }
      }

      console.error('All Synology authentication methods failed')
      return false
    } catch (error) {
      console.error('Synology authentication error:', error)
      return false
    }
  }

  // Upload image to Synology using form-data package
  // Default base path: /marketing/Ninh/thuvienanh
  async uploadImage(file: File | Buffer, filename: string, albumPath: string = 'marketing/Ninh/thuvienanh'): Promise<SynologyUploadResponse> {
    try {
      // Ensure we're authenticated
      if (!this.sessionId) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) {
          return {
            success: false,
            error: { code: 401, message: 'Authentication failed' }
          }
        }
      }

      // NOTE: Do NOT call createFolder here - it's already called in upload-synology/route.ts
      // Calling it again causes confusion in logs

      // Convert File to Buffer if needed
      let buffer: Buffer
      if (file instanceof Buffer) {
        buffer = file
      } else {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      }

      // Normalize path: REMOVE leading / for dest_folder_path parameter
      // According to Synology API examples, dest_folder_path should NOT have leading /
      console.log(`🔍 DEBUG: albumPath parameter received:`, albumPath)
      let normalizedPath = albumPath.startsWith('/') ? albumPath.substring(1) : albumPath
      // Remove double slashes
      normalizedPath = normalizedPath.replace(/\/+/g, '/')
      console.log(`🔍 DEBUG: normalizedPath after cleanup (no leading /):`, normalizedPath)

      console.log(`📤 Uploading ${filename} to ${normalizedPath} using DSM-compatible format...`)

      // Use form-data package for proper multipart/form-data
      const FormData = require('form-data')
      const form = new FormData()

      // Detect MIME type from filename extension
      const ext = filename.toLowerCase().split('.').pop()
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'bmp': 'image/bmp',
        'svg': 'image/svg+xml'
      }
      const contentType = mimeTypes[ext || 'png'] || 'application/octet-stream'

      // Add file to FormData FIRST
      form.append('file', buffer, {
        filename: filename,
        contentType: contentType
      })

      // Add destination folder path (NOT full file path!)
      // According to Synology API: parameter must be "dest_folder_path" not "path"
      form.append('dest_folder_path', normalizedPath)
      form.append('overwrite', 'true')

      // Build URL WITHOUT _sid (will use Cookie instead)
      // According to Synology Official API: "Each API request should pass a sid value via either
      // HTTP GET/POST "_sid" argument or "id" value in cookie."
      // Upload API requires Cookie format: id=<session_id>
      const uploadUrl = `${this.config.baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.Upload&method=upload&version=2`

      console.log(`📤 Upload URL: ${uploadUrl}`)
      console.log(`📤 Upload path: ${normalizedPath}`)

      // Get headers from form-data and ADD Cookie header with session ID
      const headers = form.getHeaders()
      headers['Cookie'] = `id=${this.sessionId}`  // Official Synology format: id=<session_id>

      console.log(`🔍 DEBUG: Using Cookie header with id=${this.sessionId?.substring(0, 20)}...`)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: form,
        headers: headers
      })

      const result = await response.json()

      console.log('📤 Synology upload response:', JSON.stringify(result, null, 2))

      if (result.success) {
        // Generate public URL for the uploaded image
        const imageUrl = `${this.config.baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(`${normalizedPath}/${filename}`)}&mode=open&_sid=${this.sessionId}`

        console.log('✅ Upload successful, image URL:', imageUrl)

        return {
          success: true,
          data: {
            id: `${Date.now()}-${filename}`,
            filename: filename,
            url: imageUrl,
            path: `${normalizedPath}/${filename}`
          }
        }
      }

      // Enhanced error logging for debugging
      const errorCode = result.error?.code
      const errorMsg = result.error?.message || 'Unknown error'

      console.error('❌ Synology FileStation Upload FAILED')
      console.error('📍 Location: lib/synology.ts -> uploadImage()')
      console.error('📁 Upload path:', normalizedPath)
      console.error('📄 Filename:', filename)
      console.error('🔑 Session ID:', this.sessionId ? 'Present' : 'Missing')
      console.error('⚠️  Error code:', errorCode)
      console.error('💬 Error message:', errorMsg)
      console.error('📋 Full error object:', JSON.stringify(result.error, null, 2))
      console.error('🌐 Upload URL:', uploadUrl)

      // Map common Synology error codes
      const errorMessages: { [key: number]: string } = {
        101: 'Invalid parameter - Check API params in URL',
        102: 'API does not exist',
        103: 'Method does not exist',
        104: 'This API version is not supported',
        105: 'Insufficient user privilege',
        106: 'Connection time out',
        107: 'Multiple login detected',
        119: 'SID not found',
        400: 'Invalid parameter of file operation',
        401: 'Unknown error of file operation',
        402: 'System is too busy',
        403: 'Invalid user does this file operation',
        404: 'Invalid group does this file operation',
        405: 'Invalid user and group does this file operation',
        406: 'Cannot get user/group information from the account server',
        407: 'Operation not permitted',
        408: 'No such file or directory',
        409: 'Non-supported file system',
        410: 'Failed to connect internet-based file system (ex: CIFS)',
        411: 'Read-only file system',
        412: 'Filename too long in the non-encrypted file system',
        413: 'Filename too long in the encrypted file system',
        414: 'File already exists',
        415: 'Disk quota exceeded',
        416: 'No space left on device',
        417: 'Input/output error',
        418: 'Illegal name or path',
        419: 'Illegal file name',
        420: 'Illegal file name on FAT file system',
        421: 'Device or resource busy',
        599: 'No such task of the file operation'
      }

      const detailedMsg = errorMessages[errorCode] || errorMsg

      return {
        success: false,
        error: {
          code: errorCode || 500,
          message: `[Code ${errorCode}] ${detailedMsg}`
        }
      }
    } catch (error) {
      console.error('❌ Synology upload EXCEPTION')
      console.error('📍 Location: lib/synology.ts -> uploadImage() catch block')
      console.error('📁 Upload path:', normalizedPath)
      console.error('📄 Filename:', filename)
      console.error('💥 Exception:', error)
      console.error('📚 Stack trace:', error instanceof Error ? error.stack : 'No stack trace')

      return {
        success: false,
        error: { code: 500, message: `Upload exception: ${error instanceof Error ? error.message : 'Unknown error'}` }
      }
    }
  }

  // Create folder using FileStation API
  async createFolder(folderPath: string): Promise<boolean> {
    try {
      if (!this.sessionId) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) return false
      }

      // Split path into parent and folder name
      // Example: "marketing/Ninh/thuvienanh/Album Name"
      // -> folder_path: "/marketing/Ninh/thuvienanh", name: "Album Name"
      const pathParts = folderPath.split('/')
      const folderName = pathParts.pop() || ''
      const parentPath = pathParts.join('/')

      console.log(`📁 Creating folder: "${folderName}" in path: "/${parentPath}"`)

      const response = await fetch(`${this.config.baseUrl}/webapi/entry.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api: 'SYNO.FileStation.CreateFolder',
          version: '2',
          method: 'create',
          _sid: this.sessionId!,
          folder_path: `/${parentPath}`,
          name: JSON.stringify([folderName])  // API expects array format
        })
      })

      const result = await response.json()
      console.log(`📁 Create folder response:`, JSON.stringify(result, null, 2))

      return result.success || result.error?.code === 408 // 408 = folder already exists
    } catch (error) {
      console.error('Synology create folder error:', error)
      return false
    }
  }

  // Create album/folder in Synology Photos (legacy method)
  async createAlbum(albumName: string, parentPath: string = ''): Promise<boolean> {
    // Use createFolder instead
    const fullPath = parentPath ? `${parentPath}/${albumName}` : albumName
    return this.createFolder(fullPath)
  }

  // Upload to Synology Photos (SYNO.Foto.Upload.Item) with folder_id
  async uploadToPhotos(file: File | Buffer, filename: string, folderId: number = 47): Promise<SynologyUploadResponse> {
    try {
      console.log(`📸 Uploading ${filename} to Synology Photos folder ID: ${folderId}`)

      // Ensure we're authenticated
      if (!this.sessionId) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) {
          return {
            success: false,
            error: { code: 401, message: 'Authentication failed' }
          }
        }
      }

      // Convert File to Buffer if needed
      let buffer: Buffer
      if (file instanceof Buffer) {
        buffer = file
      } else {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      }

      // Use form-data package for proper multipart/form-data
      const FormData = require('form-data')
      const form = new FormData()

      // Detect MIME type from filename extension
      const ext = filename.toLowerCase().split('.').pop()
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'bmp': 'image/bmp',
        'svg': 'image/svg+xml'
      }
      const contentType = mimeTypes[ext || 'png'] || 'application/octet-stream'

      // Add file to FormData
      form.append('file', buffer, {
        filename: filename,
        contentType: contentType
      })

      // Add folder_id parameter
      form.append('folder_id', folderId.toString())

      // Build URL with Photos API
      const uploadUrl = `${this.config.baseUrl}/photo/webapi/entry.cgi?api=SYNO.Foto.Upload.Item&method=upload&version=1&_sid=${this.sessionId}`

      console.log(`📤 Photos Upload URL: ${uploadUrl}`)
      console.log(`📁 Folder ID: ${folderId}`)
      console.log(`📄 Filename: ${filename}`)

      // Get headers from form-data
      const headers = form.getHeaders()

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: form,
        headers: headers
      })

      const result = await response.json()
      console.log(`📤 Synology Photos upload response:`, JSON.stringify(result, null, 2))

      if (result.success) {
        const uploadData = result.data
        return {
          success: true,
          data: {
            id: uploadData.id?.toString() || Date.now().toString(),
            filename: filename,
            url: this.getImageUrl(uploadData.id?.toString() || '', 'large'),
            path: `/photo/folder/${folderId}/${filename}`,
            thumbnailUrl: this.getImageUrl(uploadData.id?.toString() || '', 'thumb'),
            synologyId: uploadData.id,
            folderId: folderId
          }
        }
      } else {
        const errorCode = result.error?.code || -1
        const errorMessage = this.getErrorMessage(errorCode)

        console.error(`❌ Synology Photos Upload FAILED`)
        console.error(`📍 Location: lib/synology.ts -> uploadToPhotos()`)
        console.error(`📁 Folder ID: ${folderId}`)
        console.error(`📄 Filename: ${filename}`)
        console.error(`🔑 Session ID: ${this.sessionId ? 'Present' : 'Missing'}`)
        console.error(`⚠️  Error code: ${errorCode}`)
        console.error(`💬 Error message: ${errorMessage}`)
        console.error(`📋 Full error object:`, JSON.stringify(result.error, null, 2))
        console.error(`🌐 Upload URL: ${uploadUrl}`)

        return {
          success: false,
          error: {
            code: errorCode,
            message: `[Code ${errorCode}] ${errorMessage}`
          }
        }
      }
    } catch (error) {
      console.error(`❌ Synology Photos upload exception:`, error)
      return {
        success: false,
        error: {
          code: -1,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  // Get image URL from Synology
  getImageUrl(imageId: string, size: 'thumb' | 'small' | 'large' = 'large'): string {
    if (!this.sessionId) return ''
    
    return `${this.config.baseUrl}/photo/webapi/photo.cgi?api=SYNO.PhotoStation.Photo&version=1&method=getphoto&id=${imageId}&size=${size}&_sid=${this.sessionId}`
  }

  // Logout from Synology
  async logout(): Promise<void> {
    if (!this.sessionId) return

    try {
      await fetch(`${this.config.baseUrl}/webapi/auth.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api: 'SYNO.API.Auth',
          version: '3',
          method: 'logout',
          session: 'PhotoStation',
          _sid: this.sessionId
        })
      })
    } catch (error) {
      console.error('Synology logout error:', error)
    } finally {
      this.sessionId = null
    }
  }
}

// New Synology Photos API Service (SYNO.Foto.*)
export class SynologyPhotosAPIService {
  private config: SynologyConfig
  private sessionId: string | null = null
  private fileStationSessionId: string | null = null
  private workingUrl: string | null = null

  constructor() {
    this.config = {
      baseUrl: process.env.SYNOLOGY_BASE_URL || 'http://222.252.23.248:8888',
      alternativeUrl: process.env.SYNOLOGY_ALTERNATIVE_URL || 'http://222.252.23.248:6868',
      username: process.env.SYNOLOGY_USERNAME || 'haininh',
      password: process.env.SYNOLOGY_PASSWORD || 'Villad24@'
    }
  }

  // Test connection to Photos API
  private async testPhotosConnection(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/photo/webapi/entry.cgi?api=SYNO.API.Info&version=1&method=query&query=all`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      const data = await response.json()
      return data.success === true
    } catch (error) {
      console.warn(`Photos API connection test failed for ${url}:`, error)
      return false
    }
  }

  // Find working URL for Photos API
  private async findWorkingPhotosUrl(): Promise<string | null> {
    const urls = [this.config.baseUrl]
    if (this.config.alternativeUrl) {
      urls.push(this.config.alternativeUrl)
    }

    for (const url of urls) {
      console.log(`🔍 Testing Photos API connection to: ${url}`)
      const isWorking = await this.testPhotosConnection(url)
      if (isWorking) {
        console.log(`✅ Photos API connection successful: ${url}`)
        this.workingUrl = url
        return url
      }
      console.log(`❌ Photos API connection failed: ${url}`)
    }

    return null
  }

  // Authenticate with Synology Photos API
  async authenticate(): Promise<boolean> {
    try {
      // Find working URL first
      const workingUrl = await this.findWorkingPhotosUrl()
      if (!workingUrl) {
        console.error('❌ Cannot connect to Synology Photos API')
        return false
      }

      // Authenticate using SYNO.API.Auth
      const response = await fetch(`${workingUrl}/photo/webapi/auth.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api: 'SYNO.API.Auth',
          version: '3',
          method: 'login',
          account: this.config.username,
          passwd: this.config.password
        })
      })

      const result: SynologyAuthResponse = await response.json()
      console.log('📋 Photos API auth result:', result)

      if (result.success && result.data?.sid) {
        this.sessionId = result.data.sid
        console.log('✅ Synology Photos API authentication successful')

        // Also authenticate with FileStation for uploads
        await this.authenticateFileStation()

        return true
      }

      console.error('❌ Synology Photos API authentication failed:', result.error)
      return false
    } catch (error) {
      console.error('❌ Synology Photos API authentication error:', error)
      return false
    }
  }

  // Authenticate with FileStation (for uploads)
  private async authenticateFileStation(): Promise<boolean> {
    try {
      if (!this.workingUrl) {
        return false
      }

      const response = await fetch(`${this.workingUrl}/webapi/auth.cgi`, {
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

      const result: SynologyAuthResponse = await response.json()
      console.log('📋 FileStation auth result:', result)

      if (result.success && result.data?.sid) {
        this.fileStationSessionId = result.data.sid
        console.log('✅ FileStation authentication successful')
        return true
      }

      console.error('❌ FileStation authentication failed:', result.error)
      return false
    } catch (error) {
      console.error('❌ FileStation authentication error:', error)
      return false
    }
  }

  // Browse folders in personal space (SYNO.Foto.Browse.Folder)
  async browseFolders(offset: number = 0, limit: number = 100): Promise<SynologyPhotosFolder[]> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) return []
      }

      const response = await fetch(`${this.workingUrl}/photo/webapi/entry.cgi?api=SYNO.Foto.Browse.Folder&version=1&method=list&offset=${offset}&limit=${limit}&_sid=${this.sessionId}`, {
        method: 'GET'
      })

      const result: SynologyPhotosListResponse = await response.json()
      console.log('📋 Browse folders result:', result)

      if (result.success && result.data?.list) {
        return result.data.list as SynologyPhotosFolder[]
      }

      console.error('❌ Browse folders failed:', result.error)
      return []
    } catch (error) {
      console.error('❌ Error browsing folders:', error)
      return []
    }
  }

  // Browse folders in shared space (SYNO.FotoTeam.Browse.Folder)
  async browseSharedFolders(offset: number = 0, limit: number = 100): Promise<SynologyPhotosFolder[]> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) return []
      }

      const response = await fetch(`${this.workingUrl}/photo/webapi/entry.cgi?api=SYNO.FotoTeam.Browse.Folder&version=1&method=list&offset=${offset}&limit=${limit}&_sid=${this.sessionId}`, {
        method: 'GET'
      })

      const result: SynologyPhotosListResponse = await response.json()
      console.log('📋 Browse shared folders result:', result)

      if (result.success && result.data?.list) {
        return result.data.list as SynologyPhotosFolder[]
      }

      console.error('❌ Browse shared folders failed:', result.error)
      return []
    } catch (error) {
      console.error('❌ Error browsing shared folders:', error)
      return []
    }
  }

  // Browse albums (SYNO.Foto.Browse.Album)
  async browseAlbums(offset: number = 0, limit: number = 100): Promise<SynologyPhotosAlbum[]> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) return []
      }

      const response = await fetch(`${this.workingUrl}/photo/webapi/entry.cgi?api=SYNO.Foto.Browse.Album&version=1&method=list&offset=${offset}&limit=${limit}&_sid=${this.sessionId}`, {
        method: 'GET'
      })

      const result: SynologyPhotosListResponse = await response.json()
      console.log('📋 Browse albums result:', result)

      if (result.success && result.data?.list) {
        return result.data.list as SynologyPhotosAlbum[]
      }

      console.error('❌ Browse albums failed:', result.error)
      return []
    } catch (error) {
      console.error('❌ Error browsing albums:', error)
      return []
    }
  }

  // Upload file to Synology Photos (accepts File or Buffer)
  async uploadFile(file: File | Buffer, filename: string, folderId?: number): Promise<SynologyUploadResponse> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) {
          return {
            success: false,
            error: { code: -1, message: 'Authentication failed' }
          }
        }
      }

      // Convert Buffer to Blob if needed
      let fileToUpload: File | Blob
      if (file instanceof Buffer) {
        // Detect MIME type from filename extension
        const ext = filename.toLowerCase().split('.').pop()
        const mimeTypes: Record<string, string> = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'bmp': 'image/bmp',
          'svg': 'image/svg+xml'
        }
        const contentType = mimeTypes[ext || 'png'] || 'application/octet-stream'

        // Convert Buffer to Blob - Use Uint8Array to preserve binary data
        const uint8Array = new Uint8Array(file)
        fileToUpload = new Blob([uint8Array], { type: contentType })
        console.log(`🔄 Converted Buffer to Blob (${contentType}, ${uint8Array.length} bytes)`)
      } else {
        // File object - use directly
        fileToUpload = file
        filename = file.name
        console.log(`📁 Using File object directly (${file.type}, ${file.size} bytes)`)
      }

      // Build FormData with ALL fields (including API parameters)
      // Based on actual browser request: api, method, version must be in BOTH URL and FormData
      // IMPORTANT: duplicate and name values must be wrapped in quotes!
      const formData = new FormData()
      formData.append('api', 'SYNO.FotoTeam.Upload.Item')
      formData.append('method', 'upload_to_folder')
      formData.append('version', '1')
      formData.append('file', fileToUpload, filename)
      formData.append('duplicate', '"ignore"')  // Wrapped in quotes!
      formData.append('name', `"${filename}"`)  // Wrapped in quotes!
      formData.append('mtime', Math.floor(Date.now() / 1000).toString())
      formData.append('target_folder_id', folderId ? folderId.toString() : '1')
      // Note: thumb_xl, thumb_sm, thumb_m are optional (thumbnails)

      // Build URL with API parameters (NO _sid in URL, will use cookie instead)
      const params = new URLSearchParams({
        api: 'SYNO.FotoTeam.Upload.Item',
        version: '1',
        method: 'upload_to_folder'
      })

      const fileSize = file instanceof Buffer ? file.length : file.size
      console.log(`📤 Uploading file: ${filename} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)
      console.log(`📁 Folder ID: ${folderId || 'root'}`)

      // Debug: Log FormData entries
      console.log('📋 FormData entries:')
      for (const [key, value] of formData.entries()) {
        if (value instanceof Blob) {
          console.log(`  ${key}: [Blob ${value.size} bytes, type: ${value.type}]`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }

      const uploadUrl = `${this.workingUrl}/photo/webapi/entry.cgi?${params.toString()}`
      console.log('📋 Upload URL:', uploadUrl)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Cookie': `id=${this.sessionId}`
        },
        body: formData
      })

      const responseText = await response.text()
      console.log('📋 Raw response:', responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        console.error('❌ Failed to parse response as JSON:', e)
        throw new Error(`Invalid JSON response: ${responseText}`)
      }

      console.log('📋 Synology Photos API upload result:', JSON.stringify(result, null, 2))

      if (result.success && result.data) {
        const uploadData = result.data as SynologyPhotosUploadData

        // Generate URLs from file ID
        const thumbnailUrl = generateSynologyThumbnailUrl(
          uploadData.id,
          {
            baseUrl: this.config.baseUrl,
            sessionId: this.sessionId!
          },
          'md'
        )

        const downloadUrl = generateSynologyDownloadUrl(
          uploadData.id,
          {
            baseUrl: this.config.baseUrl,
            sessionId: this.sessionId!
          }
        )

        console.log('✅ Upload successful!')
        console.log(`   File ID: ${uploadData.id}`)
        console.log(`   Thumbnail: ${thumbnailUrl}`)
        console.log(`   Download: ${downloadUrl}`)

        return {
          success: true,
          data: {
            id: uploadData.id.toString(),
            filename: filename,
            url: downloadUrl,
            path: `folder_${uploadData.folder_id || 'root'}/${filename}`,
            thumbnailUrl: thumbnailUrl,
            synologyId: uploadData.id,
            folderId: uploadData.folder_id
          }
        }
      }

      console.error('❌ Photos API upload failed:', result.error)
      return {
        success: false,
        error: result.error || { code: -1, message: 'Upload failed' }
      }
    } catch (error) {
      console.error('❌ Upload error:', error)
      return {
        success: false,
        error: { code: -1, message: error instanceof Error ? error.message : 'Upload failed' }
      }
    }
  }

  // Getter methods for proxy API
  getWorkingUrl(): string | null {
    return this.workingUrl
  }

  getSessionId(): string | null {
    return this.sessionId
  }

  getFileStationSessionId(): string | null {
    return this.fileStationSessionId
  }

  // Get item info including cache_key
  async getItemInfo(itemId: number): Promise<any> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) return null
      }

      const response = await fetch(`${this.workingUrl}/photo/webapi/entry.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': `id=${this.sessionId}`
        },
        body: new URLSearchParams({
          api: 'SYNO.Foto.Browse.Item',
          method: 'get',
          version: '1',
          id: `[${itemId}]`,
          additional: '["thumbnail"]' // Request thumbnail info including cache_key
        })
      })

      const result = await response.json()
      console.log('📋 Item info result:', JSON.stringify(result, null, 2))

      if (result.success && result.data?.list?.[0]) {
        return result.data.list[0]
      }

      return null
    } catch (error) {
      console.error('❌ Get item info error:', error)
      return null
    }
  }

  // Get item by file path
  async getItemByPath(filePath: string): Promise<any> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) return null
      }

      // Use FileStation to get file info
      const response = await fetch(`${this.workingUrl}/webapi/entry.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          api: 'SYNO.FileStation.List',
          version: '2',
          method: 'getinfo',
          _sid: this.sessionId,
          path: filePath,
          additional: '["size","time","type"]'
        })
      })

      const result = await response.json()
      console.log('📋 Get item by path result:', JSON.stringify(result, null, 2))

      if (result.success && result.data?.files?.[0]) {
        const fileInfo = result.data.files[0]

        // Now get Photos API item ID by searching
        const photosResponse = await fetch(`${this.workingUrl}/photo/webapi/entry.cgi`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': `id=${this.sessionId}`
          },
          body: new URLSearchParams({
            api: 'SYNO.Foto.Browse.Item',
            method: 'list',
            version: '1',
            offset: '0',
            limit: '1',
            additional: '["thumbnail","resolution"]'
          })
        })

        const photosResult = await photosResponse.json()

        if (photosResult.success && photosResult.data?.list?.length > 0) {
          // Find matching item by filename
          const fileName = filePath.split('/').pop()
          const matchingItem = photosResult.data.list.find((item: any) =>
            item.filename === fileName
          )

          if (matchingItem) {
            return matchingItem
          }
        }

        // Fallback: return file info with path as ID
        return {
          id: fileInfo.path,
          filename: fileInfo.name,
          additional: {
            resolution: {
              width: 0,
              height: 0
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error('❌ Get item by path error:', error)
      return null
    }
  }

  // List photos in an album
  async listAlbumPhotos(albumId: number, limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      if (!this.sessionId || !this.workingUrl) {
        const authSuccess = await this.authenticate()
        if (!authSuccess) return []
      }

      console.log(`📸 Listing photos from album ${albumId}...`)

      const response = await fetch(`${this.workingUrl}/photo/webapi/entry.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': `id=${this.sessionId}`
        },
        body: new URLSearchParams({
          api: 'SYNO.Foto.Browse.Item',
          method: 'list',
          version: '1',
          offset: offset.toString(),
          limit: limit.toString(),
          album_id: albumId.toString(),
          additional: '["thumbnail","resolution","orientation","video_convert","video_meta","provider_user_id","exif","tag","description","gps"]'
        })
      })

      const result = await response.json()
      console.log(`📋 Album photos result (${result.data?.list?.length || 0} items)`)

      if (result.success && result.data?.list) {
        return result.data.list.map((item: any) => ({
          id: item.id,
          filename: item.filename,
          filesize: item.filesize,
          time: item.time,
          indexed_time: item.indexed_time,
          owner_user_id: item.owner_user_id,
          folder_id: item.folder_id,
          type: item.type,
          additional: item.additional,
          // Generate thumbnail URL
          thumbnailUrl: this.getPhotoThumbnailUrl(item.id, 'sm'),
          // Generate full size URL
          imageUrl: this.getPhotoThumbnailUrl(item.id, 'xl')
        }))
      }

      console.error('❌ List album photos failed:', result.error)
      return []
    } catch (error) {
      console.error('❌ Error listing album photos:', error)
      return []
    }
  }

  // Get photo thumbnail URL
  getPhotoThumbnailUrl(itemId: number, size: 'sm' | 'xl' = 'xl'): string {
    if (!this.sessionId || !this.workingUrl) return ''

    return `${this.workingUrl}/photo/webapi/entry.cgi?api=SYNO.Foto.Thumbnail&method=get&version=2&id=${itemId}&size=${size}&type=unit&_sid=${this.sessionId}`
  }

  // Logout
  async logout(): Promise<void> {
    if (!this.sessionId || !this.workingUrl) return

    try {
      await fetch(`${this.workingUrl}/photo/webapi/auth.cgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api: 'SYNO.API.Auth',
          version: '3',
          method: 'logout'
        })
      })
    } catch (error) {
      console.error('❌ Logout error:', error)
    } finally {
      this.sessionId = null
      this.workingUrl = null
    }
  }
}

// Export singleton instances
export const synologyPhotosService = new SynologyPhotosService()
export const synologyFileStationService = new SynologyFileStationService()
export const synologyPhotosAPIService = new SynologyPhotosAPIService()

// Export class alias for API proxy
export const SynologyService = SynologyPhotosAPIService

// Export all services
export const synologyService = {
  photos: synologyPhotosService,
  fileStation: synologyFileStationService,
  photosAPI: synologyPhotosAPIService,

  // Convenience methods
  async authenticate() {
    return synologyPhotosService.authenticate()
  },

  async createAlbum(albumName: string, parentPath: string = '') {
    return synologyPhotosService.createAlbum(albumName, parentPath)
  },

  async createFolder(folderPath: string) {
    return synologyPhotosService.createFolder(folderPath)
  },

  async uploadImage(file: File | Buffer, filename: string, albumPath: string = 'marketing/Ninh/thuvienanh') {
    return synologyPhotosService.uploadImage(file, filename, albumPath)
  },

  // New Photos API methods
  async browseFolders(offset?: number, limit?: number) {
    return synologyPhotosAPIService.browseFolders(offset, limit)
  },

  async browseSharedFolders(offset?: number, limit?: number) {
    return synologyPhotosAPIService.browseSharedFolders(offset, limit)
  },

  async browseAlbums(offset?: number, limit?: number) {
    return synologyPhotosAPIService.browseAlbums(offset, limit)
  },

  async uploadToPhotos(file: File | Buffer, filename: string, folderId?: number) {
    return synologyPhotosAPIService.uploadFile(file, filename, folderId)
  }
}

export default synologyService
