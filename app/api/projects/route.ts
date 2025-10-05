import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Project, CreateProjectForm, ApiResponse } from '@/types/database'

// GET /api/projects - Lấy danh sách projects với filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const project_type = searchParams.get('project_type')
    const status = searchParams.get('status')
    const location = searchParams.get('location')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let sql = `
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
      WHERE is_active = true
    `

    const params: any[] = []
    let paramIndex = 1

    // Search filter
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Project type filter
    if (project_type) {
      sql += ` AND project_type = $${paramIndex}`
      params.push(project_type)
      paramIndex++
    }

    // Status filter
    if (status) {
      sql += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    // Location filter
    if (location) {
      sql += ` AND location = $${paramIndex}`
      params.push(location)
      paramIndex++
    }

    // Order by created_at DESC
    sql += ` ORDER BY created_at DESC`

    // Limit and offset
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await query(sql, params)

    const response: ApiResponse<Project[]> = {
      success: true,
      data: result.rows
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// POST /api/projects - Tạo project mới
export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectForm = await request.json()

    const { 
      name, 
      description, 
      project_type, 
      location, 
      client_name, 
      completion_date,
      tags,
      status 
    } = body

    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Project name is required'
        } as ApiResponse<null>,
        { status: 400 }
      )
    }

    const sql = `
      INSERT INTO projects (
        name,
        description,
        project_type,
        location,
        client_name,
        completion_date,
        tags,
        status,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const params = [
      name.trim(),
      description?.trim() || null,
      project_type || null,
      location?.trim() || null,
      client_name?.trim() || null,
      completion_date || null,
      tags || [],
      status || 'planning',
      'system' // TODO: Replace with actual user ID from auth
    ]

    const result = await query(sql, params)
    const project = result.rows[0]

    const response: ApiResponse<Project> = {
      success: true,
      data: project,
      message: 'Project created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

