import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || '222.252.23.248',
  port: parseInt(process.env.DB_PORT || '5499'),
  database: process.env.DB_NAME || 'Ninh96',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Demo1234',
})

const VALID_CATEGORIES = ['phu-kien-trang-tri', 'thanh-phu-kien', 'thanh-ly', 'album']

export async function GET(
  request: Request,
  context: { params: { category: string } }
) {
  try {
    const { category } = context.params

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
        id,
        name,
        code,
        category,
        description,
        price,
        stock_quantity,
        image_url,
        created_at,
        updated_at
      FROM accessories
      WHERE category = $1
      ORDER BY created_at DESC
    `, [category])

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error fetching accessories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accessories'
      },
      { status: 500 }
    )
  }
}

