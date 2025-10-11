import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '100.101.50.87',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tva',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'haininh1',
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
        sku as code,
        category,
        description,
        price,
        stock_quantity,
        thumbnail_url as image_url,
        created_at,
        updated_at
      FROM accessories
      WHERE category = $1 AND is_active = true
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

