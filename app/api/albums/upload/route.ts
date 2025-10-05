import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { AlbumService } from '@/lib/database'
import { ApiResponse } from '@/types/database'

// POST /api/albums/upload - Upload images to album
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const albumId = formData.get('albumId') as string
    const files = formData.getAll('files') as File[]

    if (!albumId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Thiếu albumId'
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (!files || files.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không có file nào được upload'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Verify album exists
    const album = await AlbumService.getById(albumId)
    if (!album) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không tìm thấy album'
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Create upload directory if not exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'albums', albumId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedImages = []

    // Process each file
    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`)
          continue
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(7)
        const ext = file.name.split('.').pop()
        const filename = `${timestamp}-${randomStr}.${ext}`

        // Save file to disk
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)

        // Generate URL
        const imageUrl = `/uploads/albums/${albumId}/${filename}`

        // Add to database
        const albumImage = await AlbumService.addImage(
          albumId,
          `${timestamp}-${randomStr}`, // image_id
          imageUrl,
          file.name
        )

        uploadedImages.push(albumImage)

        console.log(`✅ Uploaded: ${file.name} -> ${filename}`)
      } catch (error) {
        console.error(`❌ Error uploading ${file.name}:`, error)
      }
    }

    if (uploadedImages.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Không có ảnh nào được upload thành công'
      }
      return NextResponse.json(response, { status: 500 })
    }

    const response: ApiResponse<{ uploaded: number; images: typeof uploadedImages }> = {
      success: true,
      data: {
        uploaded: uploadedImages.length,
        images: uploadedImages
      },
      message: `Upload thành công ${uploadedImages.length}/${files.length} ảnh`
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Upload images API error:', error)

    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi server khi upload ảnh'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

