import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || '222.252.23.248',
  port: parseInt(process.env.DB_PORT || '5499'),
  database: process.env.DB_NAME || 'Ninh96',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Demo1234',
})

const VALID_CATEGORIES = ['fabric', 'accessory', 'event']

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category'
        },
        { status: 400 }
      )
    }

    const result = await pool.query(`
      SELECT
        a.id,
        a.name,
        a.category,
        a.description,
        a.cover_image_url as thumbnail_url,
        a.created_at,
        a.updated_at,
        COALESCE(COUNT(ai.id), 0)::integer as image_count
      FROM albums a
      LEFT JOIN album_images ai ON a.id = ai.album_id
      WHERE a.category = $1 AND a.is_active = true
      GROUP BY a.id, a.name, a.category, a.description, a.cover_image_url, a.created_at, a.updated_at
      ORDER BY a.created_at DESC
    `, [category])

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error fetching albums:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch albums'
      },
      { status: 500 }
    )
  }
}

