import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '100.101.50.87',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tva',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'haininh1',
})

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        slug,
        description,
        image_url,
        is_featured,
        created_at,
        updated_at
      FROM styles
      ORDER BY is_featured DESC, name ASC
    `)

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error fetching styles:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch styles'
      },
      { status: 500 }
    )
  }
}

