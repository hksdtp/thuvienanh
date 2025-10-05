import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Project, ApiResponse } from '@/types/database'

// GET /api/projects/[id] - Lấy chi tiết project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const sql = `
      SELECT 
        id,
        name,
        description,
        project_type,
        location,
        client_name,
        completion_date,
        cover_image_url,
        cover_image_id,
        image_count,
        created_at,
        updated_at,
        created_by,
        is_active,
        tags,
        status
      FROM projects
      WHERE id = $1 AND is_active = true
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const {
      name,
      description,
      project_type,
      location,
      client_name,
      completion_date,
      tags,
      status,
      cover_image_id,
      cover_image_url
    } = body

    const sql = `
      UPDATE projects
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        project_type = COALESCE($3, project_type),
        location = COALESCE($4, location),
        client_name = COALESCE($5, client_name),
        completion_date = COALESCE($6, completion_date),
        tags = COALESCE($7, tags),
        status = COALESCE($8, status),
        cover_image_id = COALESCE($9, cover_image_id),
        cover_image_url = COALESCE($10, cover_image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11 AND is_active = true
      RETURNING *
    `

    const params = [
      name,
      description,
      project_type,
      location,
      client_name,
      completion_date,
      tags,
      status,
      cover_image_id,
      cover_image_url,
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

// DELETE /api/projects/[id] - Xóa project (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const sql = `
      UPDATE projects
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id
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

