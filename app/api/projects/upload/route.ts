import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { SynologyFileStationService } from '@/lib/synology'
import { ApiResponse } from '@/types/database'
import { v4 as uuidv4 } from 'uuid'

/**
 * POST /api/projects/upload
 * Upload project with images to Synology FileStation
 * Accepts FormData with files
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const type = formData.get('type') as string // 'nha-dan' or 'du-an'
    const isFeatured = formData.get('is_featured') === 'true'
    const files = formData.getAll('images') as File[]

    console.log('📤 Project upload request:', {
      name,
      description,
      location,
      type,
      isFeatured,
      filesCount: files.length
    })

    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Tên công trình là bắt buộc'
      } as ApiResponse<null>, { status: 400 })
    }

    if (!description || description.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Mô tả là bắt buộc'
      } as ApiResponse<null>, { status: 400 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng tải lên ít nhất 1 hình ảnh'
      } as ApiResponse<null>, { status: 400 })
    }

    // Create project in database
    const projectSql = `
      INSERT INTO projects (
        name,
        description,
        location,
        type,
        is_featured
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `

    const projectResult = await query(projectSql, [
      name.trim(),
      description?.trim() || null,
      location?.trim() || null,
      type, // 'nha-dan' or 'du-an'
      isFeatured
    ])

    const project = projectResult.rows[0]
    console.log(`✅ Created project: ${project.id} - ${project.name}`)

    // Upload images to Synology FileStation
    const fileStation = new SynologyFileStationService()
    const authSuccess = await fileStation.authenticate()

    if (!authSuccess) {
      console.error('❌ Failed to authenticate with Synology FileStation')
      // Continue without uploading images (project already created)
      return NextResponse.json({
        success: true,
        data: project,
        message: 'Tạo công trình thành công nhưng không thể upload ảnh. Vui lòng thử lại sau.'
      } as ApiResponse<typeof project>, { status: 201 })
    }

    // Generate folder path: /Marketing/Ninh/thuvienanh/projects/{type}/{project-name}_{project-id}
    const typeFolder = type === 'du-an' ? 'du-an' : 'nha-dan'
    const sanitizedName = name.trim().replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
    const folderName = `${sanitizedName}_${project.id}`
    const destinationPath = `/Marketing/Ninh/thuvienanh/projects/${typeFolder}/${folderName}`

    console.log(`📁 Uploading ${files.length} files to: ${destinationPath}`)

    // Upload files
    const uploadedImages = []
    const errors = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        console.log(`📤 Uploading ${i + 1}/${files.length}: ${file.name} (${file.size} bytes)`)

        const uploadResult = await fileStation.uploadFile(file, destinationPath)

        if (uploadResult.success) {
          const filePath = `${destinationPath}/${file.name}`
          // Use relative URL to avoid Next.js Image Optimizer 503 errors
          const imageUrl = `/api/synology/file-proxy?path=${encodeURIComponent(filePath)}`

          uploadedImages.push({
            image_url: imageUrl,
            image_id: uuidv4(),
            caption: file.name
          })
          console.log(`✅ Upload successful: ${file.name}`)
        } else {
          errors.push(`${file.name}: ${uploadResult.error}`)
          console.error(`❌ Failed to upload ${file.name}:`, uploadResult.error)
        }
      } catch (error) {
        errors.push(`${file.name}: ${error}`)
        console.error(`❌ Error uploading ${file.name}:`, error)
      }
    }

    // Update project with cover image and images array
    if (uploadedImages.length > 0) {
      // Build images array with URLs
      const imagesArray = uploadedImages.map(img => img.image_url)

      const updateSql = `
        UPDATE projects
        SET
          cover_image = $1,
          images = $2
        WHERE id = $3
        RETURNING *
      `

      const updatedProject = await query(updateSql, [
        uploadedImages[0].image_url, // First image as cover
        JSON.stringify(imagesArray), // All images as JSON array
        project.id
      ])

      console.log(`✅ Updated project with ${uploadedImages.length} images`)

      return NextResponse.json({
        success: true,
        data: updatedProject.rows[0],
        message: `Tạo công trình thành công với ${uploadedImages.length}/${files.length} ảnh`
      } as ApiResponse<typeof project>, { status: 201 })
    } else {
      // No images uploaded successfully
      return NextResponse.json({
        success: false,
        error: 'Không thể upload ảnh. Vui lòng thử lại.',
        data: project
      } as ApiResponse<typeof project>, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error creating project:', error)
    return NextResponse.json({
      success: false,
      error: 'Có lỗi xảy ra khi tạo công trình. Vui lòng thử lại.'
    } as ApiResponse<null>, { status: 500 })
  }
}

