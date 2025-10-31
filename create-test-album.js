// Create test album for testing upload
require('dotenv').config()
const { Pool } = require('pg')
const { v4: uuidv4 } = require('uuid')

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

async function createTestAlbum() {
  console.log('🎨 Creating test album...')

  try {
    const client = await pool.connect()

    // Create test album
    const albumId = uuidv4()
    const albumName = 'Test Upload Album'
    const category = 'fabric'
    const description = 'Album test để kiểm tra upload ảnh'

    const result = await client.query(`
      INSERT INTO albums (id, name, category, description, created_by)
      VALUES ($1, $2, $3, $4, NULL)
      RETURNING *
    `, [albumId, albumName, category, description])

    const album = result.rows[0]
    console.log('✅ Album created successfully!')
    console.log('   ID:', album.id)
    console.log('   Name:', album.name)
    console.log('   Category:', album.category)
    console.log('   Description:', album.description)
    console.log('')
    console.log('🔗 Access album at:')
    console.log(`   http://localhost:4000/albums/${album.id}`)
    console.log('')
    console.log('📝 Album ID for API testing:')
    console.log(`   ${album.id}`)

    client.release()

  } catch (error) {
    console.error('❌ Error creating album:', error.message)
  } finally {
    await pool.end()
  }
}

createTestAlbum()

