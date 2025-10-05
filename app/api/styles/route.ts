import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || '222.252.23.248',
  port: parseInt(process.env.DB_PORT || '5499'),
  database: process.env.DB_NAME || 'Ninh96',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Demo1234',
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

