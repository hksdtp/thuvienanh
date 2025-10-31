/**
 * Server-side Synology upload helper
 * Upload files to Synology NAS using FileStation API
 */

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Authenticate with Synology FileStation
 */
async function authenticateSynology(): Promise<string | null> {
  const baseUrl = process.env.SYNOLOGY_BASE_URL
  const username = process.env.SYNOLOGY_USERNAME
  const password = process.env.SYNOLOGY_PASSWORD

  if (!baseUrl || !username || !password) {
    console.error('❌ Missing Synology credentials in environment variables')
    return null
  }

  try {
    const authUrl = `${baseUrl}/webapi/entry.cgi?api=SYNO.API.Auth&version=6&method=login&account=${encodeURIComponent(username)}&passwd=${encodeURIComponent(password)}&session=FileStation&format=sid`
    
    const response = await fetch(authUrl)
    const result = await response.json()

    if (result.success && result.data?.sid) {
      console.log('✅ Synology FileStation authentication successful')
      return result.data.sid
    } else {
      console.error('❌ Synology authentication failed:', result)
      return null
    }
  } catch (error) {
    console.error('❌ Error authenticating with Synology:', error)
    return null
  }
}

/**
 * Upload file to Synology NAS
 * @param file - File to upload
 * @param folderPath - Destination folder path on Synology (e.g., "/Marketing/Ninh/thuvienanh/fabrics/CTN001")
 * @returns Upload result with URL or error
 */
export async function uploadToSynology(
  file: File,
  folderPath: string
): Promise<UploadResult> {
  try {
    const baseUrl = process.env.SYNOLOGY_BASE_URL

    if (!baseUrl) {
      return {
        success: false,
        error: 'SYNOLOGY_BASE_URL not configured'
      }
    }

    // Authenticate
    const sessionId = await authenticateSynology()
    if (!sessionId) {
      return {
        success: false,
        error: 'Failed to authenticate with Synology'
      }
    }

    // Prepare FormData
    const formData = new FormData()
    formData.append('api', 'SYNO.FileStation.Upload')
    formData.append('version', '2')
    formData.append('method', 'upload')
    formData.append('_sid', sessionId)
    formData.append('path', folderPath)
    formData.append('create_parents', 'true')
    formData.append('overwrite', 'true')
    formData.append('file', file, file.name)

    console.log(`📤 Uploading ${file.name} to ${folderPath}...`)

    // Upload file
    const uploadUrl = `${baseUrl}/webapi/entry.cgi`
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    })

    const uploadResult = await uploadResponse.json()

    if (uploadResult.success) {
      // Construct file URL for proxy access
      const fileUrl = `${folderPath}/${file.name}`
      
      console.log(`✅ Uploaded ${file.name} successfully`)
      
      return {
        success: true,
        url: fileUrl
      }
    } else {
      console.error('❌ Upload failed:', uploadResult)
      return {
        success: false,
        error: `Upload failed: ${JSON.stringify(uploadResult)}`
      }
    }
  } catch (error) {
    console.error('❌ Error uploading to Synology:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

