import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Event, ApiResponse } from '@/types/database'

// GET /api/events/[id] - Lấy chi tiết event
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
        event_type,
        event_date,
        location,
        organizer,
        attendees_count,
        cover_image_url,
        cover_image_id,
        image_count,
        created_at,
        updated_at,
        created_by,
        is_active,
        tags,
        status
      FROM events
      WHERE id = $1 AND is_active = true
    `

    const result = await query(sql, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found'
        } as ApiResponse<null>,
        { status: 404 }
      )
    }

    const response: ApiResponse<Event> = {
      success: true,
      data: result.rows[0]
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch event'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - Cập nhật event
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
      event_type,
      event_date,
      location,
      organizer,
      attendees_count,
      tags,
      status,
      cover_image_id,
      cover_image_url
    } = body

    const sql = `
      UPDATE events
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        event_type = COALESCE($3, event_type),
        event_date = COALESCE($4, event_date),
        location = COALESCE($5, location),
        organizer = COALESCE($6, organizer),
        attendees_count = COALESCE($7, attendees_count),
        tags = COALESCE($8, tags),
        status = COALESCE($9, status),
        cover_image_id = COALESCE($10, cover_image_id),
        cover_image_url = COALESCE($11, cover_image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 AND is_active = true
      RETURNING *
    `

    const params = [
      name,
      description,
      event_type,
      event_date,
      location,
      organizer,
      attendees_count,
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
          error: 'Event not found'
        } as ApiResponse<null>,
        { status: 404 }
      )
    }

    const response: ApiResponse<Event> = {
      success: true,
      data: result.rows[0],
      message: 'Event updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update event'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Xóa event (soft delete)
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    const sql = `
      UPDATE events
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id
    `

    const result = await query(sql, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found'
        } as ApiResponse<null>,
        { status: 404 }
      )
    }

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: result.rows[0].id },
      message: 'Event deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete event'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

