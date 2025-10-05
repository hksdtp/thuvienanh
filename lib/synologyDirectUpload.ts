/**
 * Synology Direct Upload - Upload trực tiếp từ browser lên Synology
 * Tránh việc file bị corrupt khi đi qua Next.js API
 */

interface SynologySession {
  workingUrl: string
  sessionId: string
}

interface UploadOptions {
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}

/**
 * Lấy Synology session từ server
 */
export async function getSynologySession(): Promise<SynologySession> {
  const response = await fetch('/api/synology/get-session')
  const result = await response.json()

  if (!result.success || !result.data) {
    throw new Error('Failed to get Synology session')
  }

  return result.data
}

/**
 * Upload file lên Synology FileStation qua API proxy
 * Dùng proxy để tránh CORS issues
 */
export async function uploadToSynology(
  file: File,
  session: SynologySession,
  destinationPath: string,
  options: UploadOptions = {}
): Promise<any> {
  const { onProgress, signal } = options

  console.log(`📤 Uploading ${file.name} (${file.size} bytes) to ${destinationPath}`)

  // Tạo FormData
  const formData = new FormData()
  formData.append('api', 'SYNO.FileStation.Upload')
  formData.append('version', '2')
  formData.append('method', 'upload')
  formData.append('_sid', session.sessionId)
  formData.append('path', destinationPath)
  formData.append('create_parents', 'true')
  formData.append('overwrite', 'true')
  formData.append('file', file, file.name)

  // Upload qua API proxy với XMLHttpRequest để track progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          onProgress(progress)
          console.log(`📊 Upload progress: ${progress}%`)
        }
      })
    }

    // Handle abort
    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort()
        reject(new Error('Upload aborted'))
      })
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      console.log(`📋 Upload response status: ${xhr.status}`)
      console.log(`📋 Upload response: ${xhr.responseText}`)

      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.success) {
            console.log(`✅ Upload successful:`, response.data)
            resolve(response.data)
          } else {
            console.error(`❌ Upload failed:`, response)
            reject(new Error(`Upload failed: ${JSON.stringify(response)}`))
          }
        } catch (error) {
          console.error(`❌ Failed to parse response:`, xhr.responseText)
          reject(new Error(`Failed to parse response: ${xhr.responseText}`))
        }
      } else {
        console.error(`❌ Upload failed with status ${xhr.status}`)
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`))
      }
    })

    // Handle errors
    xhr.addEventListener('error', () => {
      console.error(`❌ Network error during upload`)
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      console.error(`❌ Upload aborted`)
      reject(new Error('Upload aborted'))
    })

    // Send request qua API proxy
    console.log(`🔗 Sending request to /api/synology/upload-direct`)
    xhr.open('POST', '/api/synology/upload-direct')
    xhr.send(formData)
  })
}

/**
 * Upload nhiều files song song
 */
export async function uploadMultipleToSynology(
  files: File[],
  session: SynologySession,
  destinationPath: string,
  onFileProgress?: (fileName: string, progress: number) => void
): Promise<any[]> {
  const uploadPromises = files.map(file =>
    uploadToSynology(file, session, destinationPath, {
      onProgress: (progress) => {
        if (onFileProgress) {
          onFileProgress(file.name, progress)
        }
      }
    })
  )

  return Promise.all(uploadPromises)
}

/**
 * Lưu metadata vào database sau khi upload thành công
 */
export async function saveUploadedImages(
  albumId: string,
  uploadedFiles: Array<{
    name: string
    path: string
    size: number
  }>
): Promise<any> {
  const response = await fetch('/api/albums/save-uploaded', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      albumId,
      files: uploadedFiles
    })
  })

  const result = await response.json()

  if (!result.success) {
    throw new Error('Failed to save uploaded images to database')
  }

  return result.data
}

