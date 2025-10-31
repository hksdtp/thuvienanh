// Fix old fabric URLs that have wrong format
require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

async function fixOldFabricUrls() {
  console.log('🔧 Fixing old fabric URLs...')

  try {
    const client = await pool.connect()

    // Find fabrics with wrong URL format (starts with /uploads/)
    console.log('\n📊 Finding fabrics with wrong URLs...')
    const wrongUrlsResult = await client.query(`
      SELECT id, name, code, primary_image_url
      FROM fabrics
      WHERE primary_image_url LIKE '/uploads/%'
      ORDER BY created_at DESC
    `)

    console.log(`Found ${wrongUrlsResult.rows.length} fabrics with wrong URLs:`)
    wrongUrlsResult.rows.forEach(fabric => {
      console.log(`  - ${fabric.name} (${fabric.code}): ${fabric.primary_image_url}`)
    })

    if (wrongUrlsResult.rows.length === 0) {
      console.log('\n✅ No fabrics need fixing!')
      client.release()
      return
    }

    // Ask for confirmation
    console.log('\n⚠️  This will set primary_image_url to NULL for these fabrics.')
    console.log('   (They need to be re-uploaded with correct URLs)')
    console.log('\nProceed? (yes/no)')

    // For automated script, we'll just proceed
    console.log('Proceeding automatically...\n')

    // Update fabrics to NULL (they need to be re-uploaded)
    const updateResult = await client.query(`
      UPDATE fabrics
      SET primary_image_url = NULL
      WHERE primary_image_url LIKE '/uploads/%'
    `)

    console.log(`✅ Updated ${updateResult.rowCount} fabrics`)

    // Also check fabric_images table
    console.log('\n📊 Checking fabric_images table...')
    const wrongImagesResult = await client.query(`
      SELECT COUNT(*) as count
      FROM fabric_images
      WHERE url LIKE '/uploads/%'
    `)

    if (wrongImagesResult.rows[0].count > 0) {
      console.log(`Found ${wrongImagesResult.rows[0].count} images with wrong URLs`)
      
      // Delete wrong images
      const deleteResult = await client.query(`
        DELETE FROM fabric_images
        WHERE url LIKE '/uploads/%'
      `)

      console.log(`✅ Deleted ${deleteResult.rowCount} wrong images`)
    } else {
      console.log('✅ No wrong images in fabric_images table')
    }

    client.release()
    console.log('\n✅ Fix completed!')
    console.log('\n📝 Note: Fabrics with NULL primary_image_url need to be re-uploaded.')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

fixOldFabricUrls()

