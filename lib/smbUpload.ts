import SMB2 from '@marsaud/smb2'

interface SMBConfig {
  host: string
  share: string
  username: string
  password: string
  domain?: string
  port?: number
}

interface UploadResult {
  success: boolean
  path?: string
  error?: string
}

/**
 * Upload file to Synology NAS via SMB protocol
 */
export class SMBUploadService {
  private config: SMBConfig

  constructor() {
    this.config = {
      host: process.env.SMB_HOST || '222.252.23.248',
      share: process.env.SMB_SHARE || 'marketing',
      username: process.env.SMB_USERNAME || 'haininh',
      password: process.env.SMB_PASSWORD || 'Villad24@',
      domain: process.env.SMB_DOMAIN || 'WORKGROUP',
      port: parseInt(process.env.SMB_PORT || '445')
    }
  }

  /**
   * Upload a file to SMB share
   */
  async uploadFile(file: File, destinationPath: string): Promise<UploadResult> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`📤 SMB Upload: ${file.name} → ${destinationPath}`)

        // Create SMB2 client
        const smb2Client = new SMB2({
          share: `\\\\${this.config.host}\\${this.config.share}`,
          domain: this.config.domain || 'WORKGROUP',
          username: this.config.username,
          password: this.config.password,
          port: this.config.port || 445,
          autoCloseTimeout: 10000
        })

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log(`📦 File size: ${buffer.length} bytes`)
        console.log(`📁 Destination: ${destinationPath}`)

        // Write file to SMB share
        smb2Client.writeFile(destinationPath, buffer, (err: any) => {
          if (err) {
            console.error('❌ SMB upload error:', err)
            smb2Client.disconnect()
            resolve({
              success: false,
              error: err.message || 'Upload failed'
            })
          } else {
            console.log(`✅ SMB upload successful: ${destinationPath}`)
            smb2Client.disconnect()
            resolve({
              success: true,
              path: destinationPath
            })
          }
        })
      } catch (error) {
        console.error('❌ SMB upload exception:', error)
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    })
  }

  /**
   * Create directory on SMB share
   */
  async createDirectory(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const smb2Client = new SMB2({
          share: `\\\\${this.config.host}\\${this.config.share}`,
          domain: this.config.domain || 'WORKGROUP',
          username: this.config.username,
          password: this.config.password,
          port: this.config.port || 445,
          autoCloseTimeout: 10000
        })

        smb2Client.mkdir(path, (err: any) => {
          smb2Client.disconnect()
          if (err) {
            // Ignore error if directory already exists
            if (err.code === 'STATUS_OBJECT_NAME_COLLISION') {
              console.log(`📁 Directory already exists: ${path}`)
              resolve(true)
            } else {
              console.error('❌ Create directory error:', err)
              resolve(false)
            }
          } else {
            console.log(`✅ Directory created: ${path}`)
            resolve(true)
          }
        })
      } catch (error) {
        console.error('❌ Create directory exception:', error)
        resolve(false)
      }
    })
  }

  /**
   * Check if file exists
   */
  async fileExists(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const smb2Client = new SMB2({
          share: `\\\\${this.config.host}\\${this.config.share}`,
          domain: this.config.domain || 'WORKGROUP',
          username: this.config.username,
          password: this.config.password,
          port: this.config.port || 445,
          autoCloseTimeout: 10000
        })

        smb2Client.exists(path, (err: any, exists?: boolean) => {
          smb2Client.disconnect()
          if (err) {
            console.error('❌ Check file exists error:', err)
            resolve(false)
          } else {
            resolve(exists || false)
          }
        })
      } catch (error) {
        console.error('❌ Check file exists exception:', error)
        resolve(false)
      }
    })
  }
}

