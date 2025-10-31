// Check fabrics in database
require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

async function checkFabrics() {
  console.log('🔍 Checking fabrics in database...')

  try {
    const client = await pool.connect()

    // Check fabrics table
    console.log('\n📊 Checking fabrics table...')
    const fabricsResult = await client.query('SELECT id, name, code, material, color, primary_image_url, created_at FROM fabrics ORDER BY created_at DESC LIMIT 10')
    console.log(`Found ${fabricsResult.rows.length} fabrics:`)
    fabricsResult.rows.forEach(fabric => {
      console.log(`  - ${fabric.name} (${fabric.code}) - ${fabric.material} - ${fabric.color}`)
      console.log(`    Image: ${fabric.primary_image_url || 'NO IMAGE'}`)
      console.log(`    Created: ${fabric.created_at}`)
    })

    // Check fabric_images table
    console.log('\n📸 Checking fabric_images table...')
    const imagesResult = await client.query('SELECT COUNT(*) as count FROM fabric_images')
    console.log(`Total fabric images: ${imagesResult.rows[0].count}`)

    // Check recent fabric images
    console.log('\n🕐 Recent fabric images:')
    const recentResult = await client.query(`
      SELECT fi.*, f.name as fabric_name 
      FROM fabric_images fi 
      JOIN fabrics f ON fi.fabric_id = f.id 
      ORDER BY fi.uploaded_at DESC 
      LIMIT 5
    `)
    recentResult.rows.forEach(img => {
      console.log(`  - ${img.fabric_name}: ${img.url}`)
    })

    client.release()
    console.log('\n✅ Check completed!')

  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await pool.end()
  }
}

checkFabrics()

