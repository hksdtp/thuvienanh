import { NextRequest, NextResponse } from 'next/server'
import { synologyService } from '@/lib/synology'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const category = formData.get('category') as string || 'temp'
    const albumName = formData.get('albumName') as string || 'fabric-library'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    console.log(`📁 File Station upload: ${files.length} files to album "${albumName}"`)

    const results = []
    const errors = []

    // Upload directly to Ninh folder where user has write permission
    const destinationPath = `/Marketing/Ninh`

    for (const file of files) {
      try {
        console.log(`📤 Uploading ${file.name} to File Station...`)
        
        const result = await synologyService.fileStation.uploadFile(file, destinationPath)
        
        if (result.success && result.data) {
          results.push({
            id: result.data.id,
            originalName: file.name,
            fileName: result.data.filename,
            url: result.data.url,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date(),
            path: result.data.path
          })
          console.log(`✅ File Station upload successful: ${file.name}`)
        } else {
          const errorMsg = result.error?.message || 'Upload failed'
          errors.push({
            file: file.name,
            error: errorMsg
          })
          console.error(`❌ File Station upload failed: ${file.name} - ${errorMsg}`)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push({
          file: file.name,
          error: errorMsg
        })
        console.error(`❌ File Station upload error: ${file.name}`, error)
      }
    }

    // Return results
    if (results.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'All uploads failed',
          details: errors
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: results,
      errors: errors,
      message: `File Station upload completed: ${results.length} successful, ${errors.length} failed`
    })

  } catch (error) {
    console.error('❌ File Station upload API error:', error)
    return NextResponse.json(
      { 
        error: 'File Station upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'File Station Upload API',
    status: 'ready',
    timestamp: new Date().toISOString()
  })
}
