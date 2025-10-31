// Test database connection and check albums
require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

async function testDatabase() {
  console.log('🔍 Testing database connection...')
  console.log('Host:', process.env.POSTGRES_HOST)
  console.log('Database:', process.env.POSTGRES_DB)
  console.log('User:', process.env.POSTGRES_USER)

  try {
    // Test connection
    const client = await pool.connect()
    console.log('✅ Database connected!')

    // Check albums table
    console.log('\n📊 Checking albums table...')
    const albumsResult = await client.query('SELECT id, name, category, created_at FROM albums ORDER BY created_at DESC LIMIT 5')
    console.log(`Found ${albumsResult.rows.length} albums:`)
    albumsResult.rows.forEach(album => {
      console.log(`  - ${album.name} (${album.category}) - ID: ${album.id}`)
    })

    // Check album_images table
    console.log('\n📸 Checking album_images table...')
    const imagesResult = await client.query('SELECT COUNT(*) as count FROM album_images')
    console.log(`Total images: ${imagesResult.rows[0].count}`)

    // Check recent uploads
    console.log('\n🕐 Recent uploads:')
    const recentResult = await client.query(`
      SELECT ai.*, a.name as album_name 
      FROM album_images ai 
      JOIN albums a ON ai.album_id = a.id 
      ORDER BY ai.added_at DESC 
      LIMIT 5
    `)
    recentResult.rows.forEach(img => {
      console.log(`  - ${img.album_name}: ${img.image_url}`)
    })

    client.release()
    console.log('\n✅ Database test completed!')

  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await pool.end()
  }
}

testDatabase()

