import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Project, ApiResponse } from '@/types/database'
import { SynologyFileStationService } from '@/lib/synology'

// GET /api/projects/[id] - Lấy chi tiết project
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    const sql = `
      SELECT
        id,
        name,
        description,
        type,
        location,
        cover_image,
        images,
        fabrics_used,
        is_featured,
        created_at,
        updated_at
      FROM projects
      WHERE id = $1
    `

    const result = await query(sql, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        } as ApiResponse<null>,
        { status: 404 }
      )
    }

    const response: ApiResponse<Project> = {
      success: true,
      data: result.rows[0]
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Cập nhật project
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await request.json()

    const {
      name,
      description,
      type,
      location,
      cover_image
    } = body

    const sql = `
      UPDATE projects
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        location = COALESCE($4, location),
        cover_image = COALESCE($5, cover_image),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `

    const params = [
      name,
      description,
      type,
      location,
      cover_image,
      id
    ]

    const result = await query(sql, params)

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        } as ApiResponse<null>,
        { status: 404 }
      )
    }

    const response: ApiResponse<Project> = {
      success: true,
      data: result.rows[0],
      message: 'Project updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Cập nhật project (partial update)
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await request.json()

    const {
      name,
      description,
      type,
      location,
      cover_image
    } = body

    const sql = `
      UPDATE projects
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        location = COALESCE($4, location),
        cover_image = COALESCE($5, cover_image),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `

    const params = [
      name,
      description,
      type,
      location,
      cover_image,
      id
    ]

    const result = await query(sql, params)

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        } as ApiResponse<null>,
        { status: 404 }
      )
    }

    const response: ApiResponse<Project> = {
      success: true,
      data: result.rows[0],
      message: 'Project updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Xóa project (hard delete + xoá ảnh trên Synology)
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    // Get project info first
    const projectSql = `SELECT id, name, type FROM projects WHERE id = $1`
    const projectResult = await query(projectSql, [id])

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        } as ApiResponse<null>,
        { status: 404 }
      )
    }

    const project = projectResult.rows[0]
    const projectType = project.type || 'nha-dan'
    const folderPath = `/Marketing/Ninh/thuvienanh/projects/${projectType}/${project.name.toLowerCase().replace(/\s+/g, '-')}_${project.id}`

    // Delete folder from Synology NAS
    const fileStation = new SynologyFileStationService()
    const authSuccess = await fileStation.authenticate()

    if (authSuccess) {
      const deleteSuccess = await fileStation.deleteFolder(folderPath)
      if (deleteSuccess) {
        console.log(`✅ Deleted folder from Synology: ${folderPath}`)
      } else {
        console.warn(`⚠️ Failed to delete folder from Synology: ${folderPath}`)
      }
    }

    // Delete from database (CASCADE will delete project_images automatically)
    const deleteSql = `
      DELETE FROM projects
      WHERE id = $1
      RETURNING id
    `

    const result = await query(deleteSql, [id])

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: result.rows[0].id },
      message: 'Project deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

