import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { ApiResponse } from '@/types/database'

// GET /api/projects/[id]/images - Lấy danh sách ảnh của project
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    // Get images from projects.images JSONB column
    const sql = `
      SELECT images
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

    // images is a JSONB array of image URLs
    const images = result.rows[0].images || []

    const response: ApiResponse<string[]> = {
      success: true,
      data: images
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching project images:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project images'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

