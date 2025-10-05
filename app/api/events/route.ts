import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Event, CreateEventForm, ApiResponse } from '@/types/database'

// GET /api/events - Lấy danh sách events với filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const event_type = searchParams.get('event_type')
    const status = searchParams.get('status')
    const organizer = searchParams.get('organizer')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let sql = `
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

    // Event type filter
    if (event_type) {
      sql += ` AND event_type = $${paramIndex}`
      params.push(event_type)
      paramIndex++
    }

    // Status filter
    if (status) {
      sql += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    // Organizer filter
    if (organizer) {
      sql += ` AND organizer = $${paramIndex}`
      params.push(organizer)
      paramIndex++
    }

    // Order by event_date DESC, then created_at DESC
    sql += ` ORDER BY event_date DESC NULLS LAST, created_at DESC`

    // Limit and offset
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await query(sql, params)

    const response: ApiResponse<Event[]> = {
      success: true,
      data: result.rows
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

// POST /api/events - Tạo event mới
export async function POST(request: NextRequest) {
  try {
    const body: CreateEventForm = await request.json()

    const { 
      name, 
      description, 
      event_type, 
      event_date,
      location, 
      organizer,
      attendees_count,
      tags,
      status 
    } = body

    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Event name is required'
        } as ApiResponse<null>,
        { status: 400 }
      )
    }

    const sql = `
      INSERT INTO events (
        name,
        description,
        event_type,
        event_date,
        location,
        organizer,
        attendees_count,
        tags,
        status,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `

    const params = [
      name.trim(),
      description?.trim() || null,
      event_type || null,
      event_date || null,
      location?.trim() || null,
      organizer?.trim() || null,
      attendees_count || 0,
      tags || [],
      status || 'upcoming',
      'system' // TODO: Replace with actual user ID from auth
    ]

    const result = await query(sql, params)
    const event = result.rows[0]

    const response: ApiResponse<Event> = {
      success: true,
      data: event,
      message: 'Event created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create event'
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

